pub mod alerts;
pub mod benchmarks;
pub mod commands;
pub mod database;
pub mod diagnostics;
pub mod monitoring;
pub mod processes;
pub mod windows;

use alerts::AlertManager;
use commands::*;
use database::Database;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Set panic hook to log any unhandled Rust panic
    std::panic::set_hook(Box::new(|info| {
        let msg = format!("PULSE CRASH LOG\nTime: {:?}\nPanic Info: {}\n", chrono::Utc::now(), info);
        let _ = std::fs::write("pulse_panic.log", &msg);
        if let Ok(app_data) = std::env::var("APPDATA") {
            let log_dir = std::path::PathBuf::from(app_data).join("PULSE");
            let _ = std::fs::create_dir_all(&log_dir);
            let _ = std::fs::write(log_dir.join("pulse_panic.log"), &msg);
        }
    }));

    // Initialize SQLite Database
    let db = Arc::new(Database::init().expect("Failed to initialize PULSE SQLite database"));

    // Initialize Alert Manager
    let alert_manager = Arc::new(AlertManager::new());

    // Pre-warm monitoring subsystem on a separate worker thread
    // NEVER initialize sysinfo or COM on the main thread to avoid RPC_E_CHANGED_MODE with Tao's OleInitialize
    std::thread::spawn(|| {
        monitoring::init_monitor();
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { db, alert_manager })
        .invoke_handler(tauri::generate_handler![
            get_system_metrics,
            get_processes,
            kill_process,
            get_startup_items,
            toggle_startup_item,
            get_hardware_info,
            run_benchmark,
            get_benchmark_history,
            get_alerts,
            acknowledge_alert,
            get_snapshots,
            create_snapshot,
            delete_snapshot,
            get_historical_metrics,
            get_app_settings,
            save_app_settings,
            toggle_floating_widget
        ])
        .run(tauri::generate_context!())
        .expect("error while running PULSE desktop application");
}
