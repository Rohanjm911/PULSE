import { create } from "zustand";
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
import { api, defaultSettings } from "@/services/api";

export type NavTab =
  | "overview"
  | "performance"
  | "gpu"
  | "storage"
  | "network"
  | "processes"
  | "startup"
  | "diagnostics"
  | "benchmark"
  | "gaming"
  | "alerts"
  | "analytics"
  | "settings";

interface SystemState {
  activeTab: NavTab;
  metrics: SystemMetrics | null;
  history: {
    time: string;
    cpu: number;
    ram: number;
    gpu: number;
    downloadMB: number;
    uploadMB: number;
    temp: number;
  }[];
  processes: ProcessItem[];
  processSearch: string;
  processSortField: keyof ProcessItem;
  processSortAsc: boolean;
  startupItems: StartupItem[];
  hardwareInfo: HardwareInfo | null;
  benchmarkRuns: BenchmarkRun[];
  activeBenchmark: BenchmarkRun | null;
  alerts: AlertLogItem[];
  snapshots: SystemSnapshot[];
  settings: AppSettings;
  isPolling: boolean;
  selectedGpuIndex: number;
  selectedDiskIndex: number;

  // Actions
  setActiveTab: (tab: NavTab) => void;
  setProcessSearch: (q: string) => void;
  setProcessSort: (field: keyof ProcessItem) => void;
  setSelectedGpuIndex: (idx: number) => void;
  setSelectedDiskIndex: (idx: number) => void;
  fetchMetrics: () => Promise<void>;
  fetchProcesses: () => Promise<void>;
  killProcess: (pid: number) => Promise<{ success: boolean; message: string }>;
  fetchStartupItems: () => Promise<void>;
  toggleStartupItem: (id: string, enable: boolean) => Promise<boolean>;
  fetchHardwareInfo: () => Promise<void>;
  runBenchmark: (type: "cpu" | "memory" | "storage" | "all") => Promise<void>;
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  fetchSnapshots: () => Promise<void>;
  createSnapshot: (name: string) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

const MAX_HISTORY_POINTS = 40;
let pollTimer: number | null = null;

export const useSystemStore = create<SystemState>((set, get) => ({
  activeTab: "overview",
  metrics: null,
  history: [],
  processes: [],
  processSearch: "",
  processSortField: "cpuPercent",
  processSortAsc: false,
  startupItems: [],
  hardwareInfo: null,
  benchmarkRuns: [],
  activeBenchmark: null,
  alerts: [],
  snapshots: [],
  settings: defaultSettings,
  isPolling: false,
  selectedGpuIndex: 0,
  selectedDiskIndex: 0,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setProcessSearch: (q) => set({ processSearch: q }),

  setProcessSort: (field) => {
    const { processSortField, processSortAsc } = get();
    if (processSortField === field) {
      set({ processSortAsc: !processSortAsc });
    } else {
      set({ processSortField: field, processSortAsc: false });
    }
  },

  setSelectedGpuIndex: (idx) => set({ selectedGpuIndex: idx }),
  setSelectedDiskIndex: (idx) => set({ selectedDiskIndex: idx }),

  fetchMetrics: async () => {
    try {
      const data = await api.getSystemMetrics();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

      const historyPoint = {
        time: timeStr,
        cpu: Math.round(data.cpu.totalUsagePercent),
        ram: Math.round(data.memory.usagePercent),
        gpu: Math.round(data.gpu[0]?.utilizationPercent || 0),
        downloadMB: +(data.network.downloadSpeedBps / (1024 * 1024)).toFixed(2),
        uploadMB: +(data.network.uploadSpeedBps / (1024 * 1024)).toFixed(2),
        temp: Math.round(data.cpu.temperatureC || data.gpu[0]?.temperatureC || 45),
      };

      set((state) => {
        const nextHistory = [...state.history, historyPoint];
        if (nextHistory.length > MAX_HISTORY_POINTS) {
          nextHistory.shift();
        }
        return { metrics: data, history: nextHistory };
      });
    } catch (err) {
      console.error("Failed to fetch system metrics:", err);
    }
  },

  fetchProcesses: async () => {
    try {
      const procs = await api.getProcesses();
      set({ processes: procs });
    } catch (err) {
      console.error("Failed to fetch processes:", err);
    }
  },

  killProcess: async (pid: number) => {
    const res = await api.killProcess(pid);
    if (res.success) {
      await get().fetchProcesses();
    }
    return res;
  },

  fetchStartupItems: async () => {
    try {
      const items = await api.getStartupItems();
      set({ startupItems: items });
    } catch (err) {
      console.error("Failed to fetch startup items:", err);
    }
  },

  toggleStartupItem: async (id: string, enable: boolean) => {
    const ok = await api.toggleStartupItem(id, enable);
    if (ok) {
      set((state) => ({
        startupItems: state.startupItems.map((item) =>
          item.id === id ? { ...item, enabled: enable } : item
        ),
      }));
    }
    return ok;
  },

  fetchHardwareInfo: async () => {
    try {
      const info = await api.getHardwareInfo();
      set({ hardwareInfo: info });
    } catch (err) {
      console.error("Failed to fetch hardware info:", err);
    }
  },

  runBenchmark: async (type) => {
    set({
      activeBenchmark: {
        id: "bm-run",
        timestamp: Date.now(),
        testType: type,
        status: "running",
        durationMs: 0,
        progressPercent: 15,
      },
    });

    try {
      const result = await api.runBenchmark(type);
      set((state) => ({
        activeBenchmark: result,
        benchmarkRuns: [result, ...state.benchmarkRuns],
      }));
    } catch (err) {
      console.error("Benchmark error:", err);
      set({
        activeBenchmark: {
          id: "bm-err",
          timestamp: Date.now(),
          testType: type,
          status: "failed",
          durationMs: 0,
          progressPercent: 0,
        },
      });
    }
  },

  fetchAlerts: async () => {
    try {
      const alerts = await api.getAlerts();
      set({ alerts });
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  },

  acknowledgeAlert: async (id: string) => {
    await api.acknowledgeAlert(id);
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    }));
  },

  fetchSnapshots: async () => {
    try {
      const snaps = await api.getSnapshots();
      set({ snapshots: snaps });
    } catch (err) {
      console.error("Failed to fetch snapshots:", err);
    }
  },

  createSnapshot: async (name: string) => {
    const snap = await api.createSnapshot(name);
    set((state) => ({ snapshots: [snap, ...state.snapshots] }));
  },

  deleteSnapshot: async (id: string) => {
    await api.deleteSnapshot(id);
    set((state) => ({
      snapshots: state.snapshots.filter((s) => s.id !== id),
    }));
  },

  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    await api.saveAppSettings(updated);
  },

  startMonitoring: () => {
    if (pollTimer) clearInterval(pollTimer);
    get().fetchMetrics();
    get().fetchProcesses();
    get().fetchHardwareInfo();
    get().fetchStartupItems();
    get().fetchAlerts();

    const interval = get().settings.pollIntervalMs || 1000;
    pollTimer = window.setInterval(() => {
      get().fetchMetrics();
    }, interval);

    set({ isPolling: true });
  },

  stopMonitoring: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    set({ isPolling: false });
  },
}));

