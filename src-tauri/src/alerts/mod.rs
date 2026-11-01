use crate::database::Database;
use crate::monitoring::SystemMetricsPayload;
use parking_lot::Mutex;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

pub struct AlertManager {
    cooldowns: Mutex<HashMap<String, Instant>>,
}

impl AlertManager {
    pub fn new() -> Self {
        AlertManager {
            cooldowns: Mutex::new(HashMap::new()),
        }
    }

    pub fn evaluate_and_record(&self, metrics: &SystemMetricsPayload, db: &Arc<Database>) {
        let now = Instant::now();
        let mut cooldowns = self.cooldowns.lock();

        // Check CPU > 92%
        if metrics.cpu.total_usage_percent > 92.0 {
            let key = "high_cpu".to_string();
            let should_trigger = cooldowns
                .get(&key)
                .map(|t| now.duration_since(*t).as_secs() > 120)
                .unwrap_or(true);

            if should_trigger {
                cooldowns.insert(key, now);
                let id = format!("alert-{}", uuid::Uuid::new_v4());
                let title = "High CPU Utilization Detected";
                let msg = format!(
                    "CPU load sustained at {:.1}%. Review active background processes.",
                    metrics.cpu.total_usage_percent
                );
                let _ = db.insert_alert(&id, metrics.timestamp, "cpu", title, &msg, "warning");
            }
        }

        // Check RAM > 90%
        if metrics.memory.usage_percent > 90.0 {
            let key = "high_ram".to_string();
            let should_trigger = cooldowns
                .get(&key)
                .map(|t| now.duration_since(*t).as_secs() > 120)
                .unwrap_or(true);

            if should_trigger {
                cooldowns.insert(key, now);
                let id = format!("alert-{}", uuid::Uuid::new_v4());
                let title = "High Memory Pressure";
                let msg = format!(
                    "RAM consumption reached {:.1}%. Performance may be degraded.",
                    metrics.memory.usage_percent
                );
                let _ = db.insert_alert(&id, metrics.timestamp, "memory", title, &msg, "warning");
            }
        }

        // Check Disks > 90%
        for disk in &metrics.disks {
            if disk.usage_percent > 90.0 {
                let key = format!("disk_space_{}", disk.mount_point);
                let should_trigger = cooldowns
                    .get(&key)
                    .map(|t| now.duration_since(*t).as_secs() > 300)
                    .unwrap_or(true);

                if should_trigger {
                    cooldowns.insert(key, now);
                    let id = format!("alert-{}", uuid::Uuid::new_v4());
                    let title = format!("Low Disk Space on Drive {}", disk.mount_point);
                    let msg = format!(
                        "Drive {} is {:.1}% full. Available capacity is critically low.",
                        disk.mount_point, disk.usage_percent
                    );
                    let _ = db.insert_alert(&id, metrics.timestamp, "disk", &title, &msg, "warning");
                }
            }
        }
    }
}

