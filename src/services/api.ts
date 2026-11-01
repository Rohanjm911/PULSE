import { invoke } from "@tauri-apps/api/core";
import type {
  SystemMetrics,
  ProcessItem,
  StartupItem,
  HardwareInfo,
  BenchmarkRun,
  AlertLogItem,
  SystemSnapshot,
  AppSettings,
} from "@/types";

// Check if running inside Tauri desktop shell
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export const api = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    if (isTauri()) {
      return await invoke<SystemMetrics>("get_system_metrics");
    }
    // Fallback for development browser testing
    return getFallbackMetrics();
  },

  async getProcesses(): Promise<ProcessItem[]> {
    if (isTauri()) {
      return await invoke<ProcessItem[]>("get_processes");
    }
    return getFallbackProcesses();
  },

  async killProcess(pid: number): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      return await invoke<{ success: boolean; message: string }>("kill_process", { pid });
    }
    return { success: true, message: `Simulated termination of PID ${pid}` };
  },

  async getStartupItems(): Promise<StartupItem[]> {
    if (isTauri()) {
      return await invoke<StartupItem[]>("get_startup_items");
    }
    return getFallbackStartupItems();
  },

  async toggleStartupItem(id: string, enable: boolean): Promise<boolean> {
    if (isTauri()) {
      return await invoke<boolean>("toggle_startup_item", { id, enable });
    }
    return true;
  },

  async getHardwareInfo(): Promise<HardwareInfo> {
    if (isTauri()) {
      return await invoke<HardwareInfo>("get_hardware_info");
    }
    return getFallbackHardwareInfo();
  },

  async runBenchmark(testType: "cpu" | "memory" | "storage" | "all"): Promise<BenchmarkRun> {
    if (isTauri()) {
      return await invoke<BenchmarkRun>("run_benchmark", { testType });
    }
    return {
      id: "bm-" + Date.now(),
      timestamp: Date.now(),
      testType,
      cpuSingleScore: 1420,
      cpuMultiScore: 11850,
      memoryReadSpeedMBs: 48500,
      memoryLatencyNs: 68.2,
      storageSeqReadMBs: 3420,
      storageSeqWriteMBs: 2980,
      durationMs: 4200,
      status: "completed",
      progressPercent: 100,
    };
  },

  async getBenchmarkHistory(): Promise<BenchmarkRun[]> {
    if (isTauri()) {
      return await invoke<BenchmarkRun[]>("get_benchmark_history");
    }
    return [];
  },

  async getAlerts(): Promise<AlertLogItem[]> {
    if (isTauri()) {
      return await invoke<AlertLogItem[]>("get_alerts");
    }
    return [];
  },

  async acknowledgeAlert(id: string): Promise<void> {
    if (isTauri()) {
      await invoke("acknowledge_alert", { id });
    }
  },

  async getSnapshots(): Promise<SystemSnapshot[]> {
    if (isTauri()) {
      return await invoke<SystemSnapshot[]>("get_snapshots");
    }
    return [];
  },

  async createSnapshot(name: string): Promise<SystemSnapshot> {
    if (isTauri()) {
      return await invoke<SystemSnapshot>("create_snapshot", { name });
    }
    const metrics = await api.getSystemMetrics();
    return {
      id: "snap-" + Date.now(),
      name,
      timestamp: Date.now(),
      cpuUsage: metrics.cpu.totalUsagePercent,
      ramUsage: metrics.memory.usagePercent,
      gpuUsage: metrics.gpu[0]?.utilizationPercent || 0,
      diskUsage: metrics.disks[0]?.usagePercent || 0,
      healthScore: metrics.healthScore,
      uptimeSeconds: metrics.uptimeSeconds,
      processCount: 142,
      topProcesses: [
        { name: "chrome.exe", cpu: 8.5, ramMB: 1240 },
        { name: "pulse.exe", cpu: 0.8, ramMB: 120 },
      ],
    };
  },

  async deleteSnapshot(id: string): Promise<void> {
    if (isTauri()) {
      await invoke("delete_snapshot", { id });
    }
  },

  async getHistoricalMetrics(range: "1h" | "24h" | "7d" | "30d"): Promise<any[]> {
    if (isTauri()) {
      return await invoke("get_historical_metrics", { range });
    }
    return [];
  },

  async getAppSettings(): Promise<AppSettings> {
    if (isTauri()) {
      return await invoke<AppSettings>("get_app_settings");
    }
    return defaultSettings;
  },

  async saveAppSettings(settings: AppSettings): Promise<void> {
    if (isTauri()) {
      await invoke("save_app_settings", { settings });
    }
  },

  async toggleFloatingWidget(show: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("toggle_floating_widget", { show });
    }
  },
};

export const defaultSettings: AppSettings = {
  theme: "dark",
  accentColor: "#00D4FF",
  pollIntervalMs: 1000,
  historyRetentionDays: 30,
  startMinimized: false,
  minimizeToTray: true,
  floatingWidgetEnabled: false,
  floatingWidgetOpacity: 0.9,
  floatingWidgetAlwaysOnTop: true,
  alerts: [
    {
      id: "cpu-high",
      type: "cpu",
      label: "High CPU Utilization",
      enabled: true,
      threshold: 90,
      unit: "%",
      severity: "warning",
      cooldownSeconds: 60,
    },
    {
      id: "ram-high",
      type: "memory",
      label: "High RAM Utilization",
      enabled: true,
      threshold: 88,
      unit: "%",
      severity: "warning",
      cooldownSeconds: 60,
    },
    {
      id: "temp-cpu",
      type: "temp",
      label: "Critical CPU Temperature",
      enabled: true,
      threshold: 85,
      unit: "°C",
      severity: "critical",
      cooldownSeconds: 120,
    },
    {
      id: "disk-low",
      type: "disk",
      label: "Low Disk Space (<10% free)",
      enabled: true,
      threshold: 90,
      unit: "%",
      severity: "warning",
      cooldownSeconds: 300,
    },
  ],
};

function getFallbackMetrics(): SystemMetrics {
  return {
    timestamp: Date.now(),
    uptimeSeconds: 84320,
    cpu: {
      model: "Intel(R) Core(TM) i7-13700H",
      architecture: "x86_64",
      physicalCores: 14,
      logicalCores: 20,
      totalUsagePercent: 18.4,
      currentFrequencyMHz: 3400,
      baseFrequencyMHz: 2400,
      cores: Array.from({ length: 8 }, (_, i) => ({
        id: i,
        usagePercent: Math.min(100, Math.max(5, 15 + (i * 3) % 40)),
        frequencyMHz: 3200 + (i % 3) * 200,
      })),
      temperatureC: 48,
      powerWatts: 28.5,
    },
    memory: {
      totalBytes: 34359738368,
      usedBytes: 14602888806,
      freeBytes: 19756849562,
      usagePercent: 42.5,
      speedMHz: 5600,
      swapTotalBytes: 8589934592,
      swapUsedBytes: 1288490188,
      swapUsagePercent: 15.0,
    },
    gpu: [
      {
        name: "NVIDIA GeForce RTX 4070 Laptop GPU",
        vendor: "NVIDIA",
        utilizationPercent: 24.0,
        vramTotalBytes: 8589934592,
        vramUsedBytes: 2147483648,
        vramUsagePercent: 25.0,
        temperatureC: 52,
        coreClockMHz: 1980,
        memoryClockMHz: 8000,
        powerWatts: 45.2,
        fanSpeedPercent: 40,
        driverVersion: "560.81",
        isSupported: true,
      },
    ],
    disks: [
      {
        name: "NVMe Samsung MZVL21T0HCLR",
        mountPoint: "C:",
        totalBytes: 1024209543168,
        availableBytes: 429496729600,
        usedBytes: 594712813568,
        usagePercent: 58.0,
        fileSystem: "NTFS",
        diskType: "SSD",
        readBytesPerSec: 1420500,
        writeBytesPerSec: 420800,
        temperatureC: 41,
        healthStatus: "Healthy",
      },
    ],
    network: {
      activeAdapterName: "Wi-Fi 6E AX211",
      downloadSpeedBps: 2450000,
      uploadSpeedBps: 450000,
      totalDownloadedBytes: 48500200100,
      totalUploadedBytes: 12400300200,
      ipAddress: "192.168.1.145",
      macAddress: "3C:52:82:11:A4:7B",
      latencyMs: 14,
      packetLossPercent: 0,
      adapters: [
        {
          name: "Wi-Fi 6E AX211",
          ip: "192.168.1.145",
          mac: "3C:52:82:11:A4:7B",
          isUp: true,
          receivedBytes: 48500200100,
          transmittedBytes: 12400300200,
        },
      ],
    },
    healthScore: 94,
    overallStatus: "Optimal",
  };
}

function getFallbackProcesses(): ProcessItem[] {
  return [
    {
      pid: 4,
      name: "System",
      cpuPercent: 0.4,
      memoryBytes: 14200000,
      diskReadBytes: 250000,
      diskWriteBytes: 1200000,
      status: "Running",
      path: "C:\\Windows\\System32\\ntoskrnl.exe",
      isSystem: true,
      user: "SYSTEM",
    },
    {
      pid: 14280,
      name: "chrome.exe",
      cpuPercent: 5.8,
      memoryBytes: 1420000000,
      diskReadBytes: 450000,
      diskWriteBytes: 890000,
      status: "Running",
      path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      isSystem: false,
      user: "User",
    },
    {
      pid: 8912,
      name: "Code.exe",
      cpuPercent: 2.1,
      memoryBytes: 980000000,
      diskReadBytes: 120000,
      diskWriteBytes: 340000,
      status: "Running",
      path: "C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
      isSystem: false,
      user: "User",
    },
    {
      pid: 5410,
      name: "pulse.exe",
      cpuPercent: 0.6,
      memoryBytes: 110000000,
      diskReadBytes: 45000,
      diskWriteBytes: 12000,
      status: "Running",
      path: "C:\\Program Files\\PULSE\\pulse.exe",
      isSystem: false,
      user: "User",
    },
  ];
}

function getFallbackStartupItems(): StartupItem[] {
  return [
    {
      id: "startup-1",
      name: "Spotify",
      command: "C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe --autostart",
      publisher: "Spotify AB",
      location: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      enabled: true,
      source: "HKCU_Run",
    },
    {
      id: "startup-2",
      name: "Discord",
      command: "C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe",
      publisher: "Discord Inc.",
      location: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      enabled: true,
      source: "HKCU_Run",
    },
    {
      id: "startup-3",
      name: "Steam",
      command: "C:\\Program Files (x86)\\Steam\\steam.exe -silent",
      publisher: "Valve Corporation",
      location: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      enabled: false,
      source: "HKCU_Run",
    },
  ];
}

function getFallbackHardwareInfo(): HardwareInfo {
  return {
    motherboard: {
      manufacturer: "ASUSTeK COMPUTER INC.",
      product: "ROG STRIX G16 G614JV",
      serialNumber: "SN-9421873491",
    },
    bios: {
      vendor: "American Megatrends Inc.",
      version: "G614JV.321",
      releaseDate: "2024-04-12",
    },
    cpu: {
      name: "13th Gen Intel(R) Core(TM) i7-13700H",
      vendor: "GenuineIntel",
      cores: 14,
      threads: 20,
      socket: "BGA1744",
      features: ["SSE4.2", "AVX2", "FMA3", "VT-x", "AES-NI"],
    },
    ram: {
      totalCapacityBytes: 34359738368,
      sticks: [
        {
          bankLabel: "ChannelA-DIMM0",
          capacityBytes: 17179869184,
          speedMHz: 5600,
          partNumber: "M425R2GA3PB0-CWMOL",
        },
        {
          bankLabel: "ChannelB-DIMM0",
          capacityBytes: 17179869184,
          speedMHz: 5600,
          partNumber: "M425R2GA3PB0-CWMOL",
        },
      ],
    },
    os: {
      name: "Microsoft Windows 11 Pro",
      version: "10.0.22631",
      buildNumber: "22631.4317",
      architecture: "64-bit",
      installDate: "2024-01-15",
    },
  };
}

