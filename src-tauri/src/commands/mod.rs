use crate::alerts::AlertManager;
use crate::benchmarks::{execute_benchmark, BenchmarkResult};
use crate::database::Database;
use crate::diagnostics::{collect_hardware_diagnostics, HardwareReport};
use crate::monitoring::{collect_system_metrics, SystemMetricsPayload};
use crate::processes::{get_processes_list, terminate_process, ProcessItem};
use crate::windows::{get_startup_entries, toggle_startup_state, StartupItem};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

pub struct AppState {
    pub db: Arc<Database>,
    pub alert_manager: Arc<AlertManager>,
}

#[derive(serde::Serialize)]
pub struct ProcessKillResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub fn get_system_metrics(state: State<'_, AppState>) -> SystemMetricsPayload {
    let metrics = collect_system_metrics();

    // Background record in DB and evaluate alerts
    let db = Arc::clone(&state.db);
    let alert_mgr = Arc::clone(&state.alert_manager);
    let m_clone = metrics.clone();

    std::thread::spawn(move || {
        let _ = db.insert_metrics_history(
            m_clone.timestamp,
            m_clone.cpu.total_usage_percent as f64,
            m_clone.memory.usage_percent as f64,
            m_clone.gpu.first().map(|g| g.utilization_percent as f64).unwrap_or(0.0),
            m_clone.network.download_speed_bps,
            m_clone.network.upload_speed_bps,
            m_clone.cpu.temperature_c.unwrap_or(45.0) as f64,
        );
        alert_mgr.evaluate_and_record(&m_clone, &db);
    });

    metrics
}

#[tauri::command]
pub fn get_processes() -> Vec<ProcessItem> {
    get_processes_list()
}

#[tauri::command]
pub fn kill_process(pid: u32) -> ProcessKillResult {
    match terminate_process(pid) {
        Ok(_) => ProcessKillResult {
            success: true,
            message: format!("Process PID {} successfully terminated.", pid),
        },
        Err(e) => ProcessKillResult {
            success: false,
            message: e,
        },
    }
}

#[tauri::command]
pub fn get_startup_items() -> Vec<StartupItem> {
    get_startup_entries()
}

#[tauri::command]
pub fn toggle_startup_item(id: String, enable: bool) -> bool {
    toggle_startup_state(&id, enable).unwrap_or(false)
}

#[tauri::command]
pub fn get_hardware_info() -> HardwareReport {
    collect_hardware_diagnostics()
}

#[tauri::command]
pub fn run_benchmark(test_type: String, state: State<'_, AppState>) -> BenchmarkResult {
    let result = execute_benchmark(&test_type);
    let _ = state.db.insert_benchmark(
        &result.id,
        result.timestamp,
        &result.test_type,
        result.cpu_single_score,
        result.cpu_multi_score,
        result.memory_read_speed_m_bs,
        result.memory_latency_ns,
        result.storage_seq_read_m_bs,
        result.storage_seq_write_m_bs,
        result.duration_ms as i64,
    );
    result
}

#[tauri::command]
pub fn get_benchmark_history(state: State<'_, AppState>) -> Vec<serde_json::Value> {
    state.db.get_benchmarks().unwrap_or_default()
}

#[tauri::command]
pub fn get_alerts(state: State<'_, AppState>) -> Vec<serde_json::Value> {
    state.db.get_alerts().unwrap_or_default()
}

#[tauri::command]
pub fn acknowledge_alert(id: String, state: State<'_, AppState>) {
    let _ = state.db.acknowledge_alert(&id);
}

#[tauri::command]
pub fn get_snapshots(state: State<'_, AppState>) -> Vec<serde_json::Value> {
    state.db.get_snapshots().unwrap_or_default()
}

#[tauri::command]
pub fn create_snapshot(name: String, state: State<'_, AppState>) -> serde_json::Value {
    let metrics = collect_system_metrics();
    let procs = get_processes_list();

    let top_procs: Vec<serde_json::Value> = procs
        .into_iter()
        .take(5)
        .map(|p| {
            serde_json::json!({
                "name": p.name,
                "cpu": p.cpu_percent,
                "ramMB": (p.memory_bytes / (1024 * 1024))
            })
        })
        .collect();

    let id = format!("snap-{}", uuid::Uuid::new_v4());
    let ts = chrono::Utc::now().timestamp_millis();

    let data_json = serde_json::json!({
        "cpuUsage": metrics.cpu.total_usage_percent,
        "ramUsage": metrics.memory.usage_percent,
        "gpuUsage": metrics.gpu.first().map(|g| g.utilization_percent).unwrap_or(0.0),
        "diskUsage": metrics.disks.first().map(|d| d.usage_percent).unwrap_or(0.0),
        "healthScore": metrics.health_score,
        "uptimeSeconds": metrics.uptime_seconds,
        "processCount": 120,
        "topProcesses": top_procs
    });

    let _ = state
        .db
        .insert_snapshot(&id, ts, &name, &data_json.to_string());

    serde_json::json!({
        "id": id,
        "timestamp": ts,
        "name": name,
        "cpuUsage": metrics.cpu.total_usage_percent,
        "ramUsage": metrics.memory.usage_percent,
        "gpuUsage": metrics.gpu.first().map(|g| g.utilization_percent).unwrap_or(0.0),
        "diskUsage": metrics.disks.first().map(|d| d.usage_percent).unwrap_or(0.0),
        "healthScore": metrics.health_score,
        "uptimeSeconds": metrics.uptime_seconds,
        "processCount": 120,
        "topProcesses": data_json.get("topProcesses")
    })
}

#[tauri::command]
pub fn delete_snapshot(id: String, state: State<'_, AppState>) {
    let _ = state.db.delete_snapshot(&id);
}

#[tauri::command]
pub fn get_historical_metrics(range: String, state: State<'_, AppState>) -> Vec<serde_json::Value> {
    state.db.get_historical_metrics(&range).unwrap_or_default()
}

#[tauri::command]
pub fn get_app_settings(state: State<'_, AppState>) -> serde_json::Value {
    if let Ok(Some(str_val)) = state.db.get_setting("user_settings") {
        if let Ok(v) = serde_json::from_str(&str_val) {
            return v;
        }
    }
    serde_json::json!({
        "theme": "dark",
        "accentColor": "#00D4FF",
        "pollIntervalMs": 1000,
        "historyRetentionDays": 30,
        "startMinimized": false,
        "minimizeToTray": true,
        "floatingWidgetEnabled": false,
        "floatingWidgetOpacity": 0.9,
        "floatingWidgetAlwaysOnTop": true
    })
}

#[tauri::command]
pub fn save_app_settings(settings: serde_json::Value, state: State<'_, AppState>) {
    let _ = state
        .db
        .save_setting("user_settings", &settings.to_string());
}

#[tauri::command]
pub fn toggle_floating_widget(show: bool, app: AppHandle) {
    if let Some(window) = app.get_webview_window("floating-widget") {
        if show {
            let _ = window.show();
            let _ = window.set_focus();
        } else {
            let _ = window.hide();
        }
    }
}

