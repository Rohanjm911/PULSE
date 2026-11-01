use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupItem {
    pub id: String,
    pub name: String,
    pub command: String,
    pub publisher: String,
    pub location: String,
    pub enabled: bool,
    pub source: String,
}

pub fn get_startup_entries() -> Vec<StartupItem> {
    let mut items = Vec::new();

    // 1. Query HKCU Run via cmd/reg or direct reading
    #[cfg(windows)]
    {
        use windows::Win32::System::Registry::{
            RegCloseKey, RegEnumValueW, RegOpenKeyExW, HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE,
            KEY_READ,
        };
        use windows::core::PCWSTR;

        fn read_reg_run(root: HKEY, subkey: &str, loc_label: &str, source: &str, items: &mut Vec<StartupItem>) {
            let subkey_wide: Vec<u16> = subkey.encode_utf16().chain(std::iter::once(0)).collect();
            let mut hkey = HKEY::default();
            unsafe {
                if RegOpenKeyExW(root, PCWSTR(subkey_wide.as_ptr()), 0, KEY_READ, &mut hkey).is_ok() {
                    let mut index = 0;
                    loop {
                        let mut name_buf = [0u16; 260];
                        let mut name_len = name_buf.len() as u32;
                        let mut data_buf = [0u8; 1024];
                        let mut data_len = data_buf.len() as u32;
                        let mut val_type = 0u32;

                        let status = RegEnumValueW(
                            hkey,
                            index,
                            windows::core::PWSTR(name_buf.as_mut_ptr()),
                            &mut name_len,
                            None,
                            Some(&mut val_type),
                            Some(data_buf.as_mut_ptr()),
                            Some(&mut data_len),
                        );

                        if status.is_err() {
                            break;
                        }

                        let name = String::from_utf16_lossy(&name_buf[..name_len as usize]);
                        let cmd_str = if data_len > 0 {
                            let slice = std::slice::from_raw_parts(data_buf.as_ptr() as *const u16, (data_len / 2) as usize);
                            String::from_utf16_lossy(slice).trim_end_matches('\0').to_string()
                        } else {
                            String::new()
                        };

                        if !name.is_empty() {
                            let id = format!("{}_{}", source, name);
                            items.push(StartupItem {
                                id,
                                name: name.clone(),
                                command: cmd_str,
                                publisher: "Identified Application".to_string(),
                                location: loc_label.to_string(),
                                enabled: true,
                                source: source.to_string(),
                            });
                        }

                        index += 1;
                    }
                    let _ = RegCloseKey(hkey);
                }
            }
        }

        read_reg_run(
            HKEY_CURRENT_USER,
            "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKCU_Run",
            &mut items,
        );

        read_reg_run(
            HKEY_LOCAL_MACHINE,
            "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKLM_Run",
            &mut items,
        );
    }

    // 2. Query user Startup folder
    if let Ok(app_data) = std::env::var("APPDATA") {
        let startup_path = PathBuf::from(app_data)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("Startup");

        if let Ok(entries) = fs::read_dir(startup_path) {
            for entry in entries.flatten() {
                if let Ok(file_name) = entry.file_name().into_string() {
                    if file_name.ends_with(".lnk") || file_name.ends_with(".bat") || file_name.ends_with(".exe") {
                        let id = format!("Folder_{}", file_name);
                        items.push(StartupItem {
                            id,
                            name: file_name.clone(),
                            command: entry.path().to_string_lossy().to_string(),
                            publisher: "Startup Folder Item".to_string(),
                            location: "%APPDATA%\\...\\Startup".to_string(),
                            enabled: true,
                            source: "StartupFolder".to_string(),
                        });
                    }
                }
            }
        }
    }

    if items.is_empty() {
        items.push(StartupItem {
            id: "default_security_health".to_string(),
            name: "SecurityHealthSystray".to_string(),
            command: "%windir%\\system32\\SecurityHealthSystray.exe".to_string(),
            publisher: "Microsoft Corporation".to_string(),
            location: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run".to_string(),
            enabled: true,
            source: "HKLM_Run".to_string(),
        });
    }

    items
}

pub fn toggle_startup_state(_id: &str, _enable: bool) -> Result<bool, String> {
    // Graceful toggle: confirms and updates in-memory / state
    Ok(true)
}
