use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn init() -> Result<Self> {
        let db_path = get_database_path();
        if let Some(parent) = db_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let conn = Connection::open(&db_path)?;
        conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;

            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                cpu_usage REAL NOT NULL,
                ram_usage REAL NOT NULL,
                gpu_usage REAL NOT NULL,
                download_bps INTEGER NOT NULL,
                upload_bps INTEGER NOT NULL,
                temp_c REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics_history(timestamp);

            CREATE TABLE IF NOT EXISTS alert_logs (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                alert_type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                severity TEXT NOT NULL,
                acknowledged INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alert_logs(timestamp);

            CREATE TABLE IF NOT EXISTS benchmark_history (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                test_type TEXT NOT NULL,
                cpu_single REAL,
                cpu_multi REAL,
                memory_speed REAL,
                memory_latency REAL,
                storage_seq_read REAL,
                storage_seq_write REAL,
                duration_ms INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_benchmark_timestamp ON benchmark_history(timestamp);

            CREATE TABLE IF NOT EXISTS snapshots (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                name TEXT NOT NULL,
                data_json TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp);

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            "
        )?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn insert_metrics_history(
        &self,
        timestamp: i64,
        cpu: f64,
        ram: f64,
        gpu: f64,
        download_bps: u64,
        upload_bps: u64,
        temp_c: f64,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO metrics_history (timestamp, cpu_usage, ram_usage, gpu_usage, download_bps, upload_bps, temp_c)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![timestamp, cpu, ram, gpu, download_bps as i64, upload_bps as i64, temp_c],
        )?;
        Ok(())
    }

    pub fn prune_old_metrics(&self, retention_days: u32) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        let cutoff = chrono::Utc::now().timestamp_millis() - (retention_days as i64 * 86_400_000);
        conn.execute(
            "DELETE FROM metrics_history WHERE timestamp < ?1",
            params![cutoff],
        )
    }

    pub fn get_historical_metrics(&self, range: &str) -> Result<Vec<serde_json::Value>> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp_millis();
        let duration_ms = match range {
            "1h" => 3600 * 1000,
            "24h" => 24 * 3600 * 1000,
            "7d" => 7 * 24 * 3600 * 1000,
            "30d" => 30 * 24 * 3600 * 1000,
            _ => 24 * 3600 * 1000,
        };
        let cutoff = now - duration_ms;

        let mut stmt = conn.prepare(
            "SELECT timestamp, cpu_usage, ram_usage, gpu_usage, download_bps, upload_bps, temp_c
             FROM metrics_history
             WHERE timestamp >= ?1
             ORDER BY timestamp ASC",
        )?;

        let rows = stmt.query_map(params![cutoff], |row| {
            let ts: i64 = row.get(0)?;
            let cpu: f64 = row.get(1)?;
            let ram: f64 = row.get(2)?;
            let gpu: f64 = row.get(3)?;
            let down: i64 = row.get(4)?;
            let up: i64 = row.get(5)?;
            let temp: f64 = row.get(6)?;

            Ok(serde_json::json!({
                "timestamp": ts,
                "cpuUsage": cpu,
                "ramUsage": ram,
                "gpuUsage": gpu,
                "downloadBps": down,
                "uploadBps": up,
                "temperatureC": temp
            }))
        })?;

        let mut result = Vec::new();
        for r in rows {
            if let Ok(val) = r {
                result.push(val);
            }
        }
        Ok(result)
    }

    pub fn insert_alert(
        &self,
        id: &str,
        timestamp: i64,
        alert_type: &str,
        title: &str,
        message: &str,
        severity: &str,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO alert_logs (id, timestamp, alert_type, title, message, severity, acknowledged)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)",
            params![id, timestamp, alert_type, title, message, severity],
        )?;
        Ok(())
    }

    pub fn get_alerts(&self) -> Result<Vec<serde_json::Value>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, alert_type, title, message, severity, acknowledged
             FROM alert_logs ORDER BY timestamp DESC LIMIT 50",
        )?;

        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let ts: i64 = row.get(1)?;
            let a_type: String = row.get(2)?;
            let title: String = row.get(3)?;
            let msg: String = row.get(4)?;
            let sev: String = row.get(5)?;
            let ack: i32 = row.get(6)?;

            Ok(serde_json::json!({
                "id": id,
                "timestamp": ts,
                "type": a_type,
                "title": title,
                "message": msg,
                "severity": sev,
                "acknowledged": ack != 0
            }))
        })?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(v) = r {
                list.push(v);
            }
        }
        Ok(list)
    }

    pub fn acknowledge_alert(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE alert_logs SET acknowledged = 1 WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn insert_benchmark(
        &self,
        id: &str,
        timestamp: i64,
        test_type: &str,
        cpu_single: Option<f64>,
        cpu_multi: Option<f64>,
        mem_speed: Option<f64>,
        mem_latency: Option<f64>,
        storage_read: Option<f64>,
        storage_write: Option<f64>,
        duration_ms: i64,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO benchmark_history (id, timestamp, test_type, cpu_single, cpu_multi, memory_speed, memory_latency, storage_seq_read, storage_seq_write, duration_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                id, timestamp, test_type, cpu_single, cpu_multi, mem_speed, mem_latency, storage_read, storage_write, duration_ms
            ],
        )?;
        Ok(())
    }

    pub fn get_benchmarks(&self) -> Result<Vec<serde_json::Value>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, test_type, cpu_single, cpu_multi, memory_speed, memory_latency, storage_seq_read, storage_seq_write, duration_ms
             FROM benchmark_history ORDER BY timestamp DESC LIMIT 30",
        )?;

        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let ts: i64 = row.get(1)?;
            let t_type: String = row.get(2)?;
            let cpu_s: Option<f64> = row.get(3)?;
            let cpu_m: Option<f64> = row.get(4)?;
            let mem_s: Option<f64> = row.get(5)?;
            let mem_l: Option<f64> = row.get(6)?;
            let s_read: Option<f64> = row.get(7)?;
            let s_write: Option<f64> = row.get(8)?;
            let dur: i64 = row.get(9)?;

            Ok(serde_json::json!({
                "id": id,
                "timestamp": ts,
                "testType": t_type,
                "cpuSingleScore": cpu_s,
                "cpuMultiScore": cpu_m,
                "memoryReadSpeedMBs": mem_s,
                "memoryLatencyNs": mem_l,
                "storageSeqReadMBs": s_read,
                "storageSeqWriteMBs": s_write,
                "durationMs": dur,
                "status": "completed",
                "progressPercent": 100
            }))
        })?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(v) = r {
                list.push(v);
            }
        }
        Ok(list)
    }

    pub fn insert_snapshot(&self, id: &str, timestamp: i64, name: &str, data_json: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO snapshots (id, timestamp, name, data_json) VALUES (?1, ?2, ?3, ?4)",
            params![id, timestamp, name, data_json],
        )?;
        Ok(())
    }

    pub fn get_snapshots(&self) -> Result<Vec<serde_json::Value>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, name, data_json FROM snapshots ORDER BY timestamp DESC LIMIT 20",
        )?;

        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let ts: i64 = row.get(1)?;
            let name: String = row.get(2)?;
            let json_str: String = row.get(3)?;
            let data: serde_json::Value = serde_json::from_str(&json_str).unwrap_or(serde_json::json!({}));

            Ok(serde_json::json!({
                "id": id,
                "timestamp": ts,
                "name": name,
                "cpuUsage": data.get("cpuUsage").and_then(|v| v.as_f64()).unwrap_or(0.0),
                "ramUsage": data.get("ramUsage").and_then(|v| v.as_f64()).unwrap_or(0.0),
                "gpuUsage": data.get("gpuUsage").and_then(|v| v.as_f64()).unwrap_or(0.0),
                "diskUsage": data.get("diskUsage").and_then(|v| v.as_f64()).unwrap_or(0.0),
                "healthScore": data.get("healthScore").and_then(|v| v.as_i64()).unwrap_or(90),
                "uptimeSeconds": data.get("uptimeSeconds").and_then(|v| v.as_i64()).unwrap_or(0),
                "processCount": data.get("processCount").and_then(|v| v.as_i64()).unwrap_or(0),
                "topProcesses": data.get("topProcesses").unwrap_or(&serde_json::json!([]))
            }))
        })?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(v) = r {
                list.push(v);
            }
        }
        Ok(list)
    }

    pub fn delete_snapshot(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM snapshots WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn save_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let mut rows = stmt.query(params![key])?;
        if let Some(row) = rows.next()? {
            let val: String = row.get(0)?;
            Ok(Some(val))
        } else {
            Ok(None)
        }
    }
}

fn get_database_path() -> PathBuf {
    if let Ok(app_data) = std::env::var("APPDATA") {
        PathBuf::from(app_data).join("PULSE").join("pulse_data.db")
    } else {
        PathBuf::from("pulse_data.db")
    }
}

