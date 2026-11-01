use serde::{Deserialize, Serialize};
use sysinfo::{Pid, System};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessItem {
    pub pid: u32,
    pub name: String,
    pub cpu_percent: f32,
    pub memory_bytes: u64,
    pub disk_read_bytes: u64,
    pub disk_write_bytes: u64,
    pub status: String,
    pub path: String,
    pub is_system: bool,
    pub user: String,
}

// Critical Windows processes that should be protected
const CRITICAL_SYSTEM_PROCESSES: &[&str] = &[
    "system",
    "registry",
    "smss.exe",
    "csrss.exe",
    "wininit.exe",
    "services.exe",
    "lsass.exe",
    "winlogon.exe",
    "fontdrvhost.exe",
    "dwm.exe",
    "svchost.exe",
    "explorer.exe",
    "sihost.exe",
    "taskhostw.exe",
    "runtimebroker.exe",
];

pub fn is_protected_process(name: &str, pid: u32) -> bool {
    if pid <= 4 {
        return true;
    }
    let name_lower = name.to_lowercase();
    CRITICAL_SYSTEM_PROCESSES
        .iter()
        .any(|crit| name_lower == *crit)
}

pub fn get_processes_list() -> Vec<ProcessItem> {
    let mut sys = System::new_all();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut list = Vec::new();

    for (pid, proc_) in sys.processes() {
        let name = proc_.name().to_string_lossy().to_string();
        let pid_u32 = pid.as_u32();
        let is_system = is_protected_process(&name, pid_u32);
        let path = proc_
            .exe()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| "System".to_string());

        let disk_usage = proc_.disk_usage();

        list.push(ProcessItem {
            pid: pid_u32,
            name,
            cpu_percent: proc_.cpu_usage(),
            memory_bytes: proc_.memory(),
            disk_read_bytes: disk_usage.read_bytes,
            disk_write_bytes: disk_usage.written_bytes,
            status: format!("{:?}", proc_.status()),
            path,
            is_system,
            user: proc_
                .user_id()
                .map(|u| format!("{:?}", u))
                .unwrap_or_else(|| "User".to_string()),
        });
    }

    // Sort by CPU usage descending by default
    list.sort_by(|a, b| b.cpu_percent.partial_cmp(&a.cpu_percent).unwrap_or(std::cmp::Ordering::Equal));
    list
}

pub fn terminate_process(pid: u32) -> Result<(), String> {
    let mut sys = System::new_all();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let sys_pid = Pid::from_u32(pid);
    if let Some(proc_) = sys.process(sys_pid) {
        let name = proc_.name().to_string_lossy().to_string();
        if is_protected_process(&name, pid) {
            return Err(format!(
                "Cannot terminate protected Windows system process '{}' (PID: {}).",
                name, pid
            ));
        }

        if proc_.kill() {
            Ok(())
        } else {
            Err(format!("Failed to terminate process PID {}", pid))
        }
    } else {
        Err(format!("Process with PID {} was not found.", pid))
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protected_processes() {
        assert!(is_protected_process("csrss.exe", 1234));
        assert!(is_protected_process("System", 4));
        assert!(is_protected_process("wininit.exe", 567));
        assert!(!is_protected_process("notepad.exe", 9999));
        assert!(!is_protected_process("chrome.exe", 8888));
    }
}
