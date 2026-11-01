# PULSE Architecture Documentation

## 1. Architectural Overview

PULSE is structured around a decoupled, asynchronous desktop architecture where:
1. **The Rust Backend** acts as the high-privilege, low-overhead system monitoring, persistence, and hardware diagnostics engine.
2. **The React Frontend** acts as the high-performance presentation, data visualization, and user interaction layer.
3. **The Tauri 2 IPC Layer** handles bi-directional, type-safe communication between Rust and the web view without exposing raw shell or command-line execution interfaces.
4. **The SQLite Engine** provides local historical metrics retention, structured snapshot comparisons, and setting persistence.

```mermaid
flowchart TD
    subgraph Frontend["Presentation Layer (React + TS)"]
        UI[PULSE Interface & Layout]
        ECharts[Apache ECharts Visualizations]
        Store[Zustand State Store]
        APIBridge[Tauri IPC API Bridge]
    end

    subgraph TauriIPC["Tauri 2 IPC Boundary"]
        Commands[Tauri Invoke Handlers]
    end

    subgraph Backend["System Engine (Rust)"]
        Mon[Monitoring Subsystem (sysinfo)]
        Proc[Process Manager & Guardrails]
        Diag[WMI & Hardware Diagnostics]
        Bench[Synthetic Benchmark Engines]
        Alerts[Smart Alert Manager]
        Win[Windows Registry Integration]
        DB[(SQLite Embedded DB)]
    end

    UI --> Store
    Store --> ECharts
    Store --> APIBridge
    APIBridge --> Commands
    Commands --> Mon
    Commands --> Proc
    Commands --> Diag
    Commands --> Bench
    Commands --> Alerts
    Commands --> Win
    Mon --> DB
    Alerts --> DB
    Bench --> DB
```

---

## 2. Component Subsystems

### System Monitoring Engine (`src-tauri/src/monitoring/mod.rs`)
- Continuously collects CPU core loads, frequencies, and thermal values.
- Retrieves physical memory allocations and Windows pagefile/swap sizes.
- Queries graphics adapters via DXGI and WMI `Win32_VideoController`.
- Calculates delta network throughput across physical and virtual network adapters.
- Evaluates composite System Health Scores (0 to 100) based on resource pressures.

### Process Management & Guardrails (`src-tauri/src/processes/mod.rs`)
- Enumerates running Windows processes with PID, working set memory, disk I/O, and executable paths.
- Enforces hard safety barriers: Windows critical system processes (`smss.exe`, `csrss.exe`, `wininit.exe`, `services.exe`, `lsass.exe`, `winlogon.exe`, `dwm.exe`, `svchost.exe`, `explorer.exe`, etc.) are protected from termination.
- Non-system processes require explicit two-step user confirmation before termination.

### SQLite Persistence Layer (`src-tauri/src/database/mod.rs`)
- Embedded SQLite engine running in Write-Ahead Logging (`WAL`) mode with `NORMAL` synchrony for high-throughput, low-overhead logging.
- Automatically handles index creation (`timestamp`), pruning old logs according to user-configured retention policies, and serializing system snapshots.

### Hardware Diagnostics (`src-tauri/src/diagnostics/mod.rs`)
- Queries hardware specs through WMI COM tables: `Win32_BaseBoard`, `Win32_BIOS`, `Win32_Processor`, `Win32_PhysicalMemory`, `Win32_OperatingSystem`.
- Surfaces RAM module bank labels, speeds in MT/s, and part numbers.
- Supports instant client-side PDF and CSV report export.

### Synthetic Benchmarking Engine (`src-tauri/src/benchmarks/mod.rs`)
- **CPU Single-Thread**: Compute-bound prime sieve over a controlled interval.
- **CPU Multi-Thread**: Multi-threaded parallel workload utilizing all logical threads.
- **Memory Throughput**: Sequential block read/write and pointer-chasing latency.
- **Storage Benchmark**: Sequential read/write test using isolated temporary files in `%TEMP%\pulse_benchmark_temp.dat` that are guaranteed to be deleted immediately upon completion.

