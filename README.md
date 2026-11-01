<p align="center">
  <img src="https://raw.githubusercontent.com/Rohanjm911/PULSE/main/Pulse.gif" alt="PULSE - Live System Health Dashboard Animation" width="280" />
</p>

<p align="center">
  <a href="https://github.com/Rohanjm911/PULSE">
    <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&pause=1200&color=00D4FF&center=true&vCenter=true&width=700&lines=PULSE+%E2%80%94+ADVANCED+SYSTEM+MONITORING;Real-Time+NVIDIA+GeForce+RTX+Telemetry;Dynamic+Intel+%26+AMD+Multi-Core+Scaling;Zero+Mock+Data+%E2%80%94+100%25+Real+Windows+APIs;Engineered+with+Tauri+2%2C+Rust+%26+React+19" alt="PULSE Typing Animation" />
  </a>
</p>

<p align="center">
  <strong>Know Your Machine. Own Your Performance.</strong><br>
  <em>Premium Windows Desktop System Monitoring, Hardware Diagnostics & Performance Management Suite</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%7C%20Windows%2011-00D4FF?style=for-the-badge&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Engine-Tauri%202%20%2B%20Rust-35D07F?style=for-the-badge&logo=rust&logoColor=white" alt="Engine" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TS-8585FF?style=for-the-badge&logo=react&logoColor=white" alt="Frontend" />
  <img src="https://img.shields.io/badge/GPU-NVIDIA%20GeForce%20RTX-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="GPU" />
  <img src="https://img.shields.io/badge/Telemetry-100%25%20Real%20Hardware-FF5252?style=for-the-badge" alt="Telemetry" />
</p>

---

## ⚡ Direct Standalone Application Launch (`pulse.exe`)

PULSE is pre-compiled as an optimized, standalone Windows native application ready to run instantly with **zero installation**, zero external databases, and zero background services:

| Executable | Location | Size | Status |
| :--- | :--- | :--- | :--- |
| **Root Binary (Direct Launch)** | [`pulse.exe`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/PULSE/pulse.exe) | **~7.9 MB** | 🟢 **Ready to Run** |
| **Release Target Build** | [`src-tauri/target/release/pulse.exe`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/PULSE/src-tauri/target/release/pulse.exe) | **~7.9 MB** | 🟢 **Optimized Release** |

```powershell
# Launch directly from the terminal or double-click pulse.exe:
.\pulse.exe
```

---

## 🚀 Key Highlights & Hardware Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│  PULSE CORE TELEMETRY MATRIX                                           │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ CPU Telemetry    │ 2.92 GHz+ Base Clock & Load-scaled Dynamic Turbo │
│  🎮 NVIDIA Telemetry │ GeForce RTX Dedicated VRAM, 55°C Sensors, Clocks │
│  🧠 Memory Telemetry │ Active Working-Set, Standby Cache & Pagefile     │
│  💾 Storage Health   │ SMART Disk Diagnostics & Low Space Triggers     │
│  🌐 Network Engine   │ ICMP Latency, Adapter MACs, Dual Speedometers   │
│  🛡️ Gaming HUD       │ Translucent Anti-Cheat Safe Floating Monitor    │
│  🎬 Startup Engine   │ Pure Black Seamless Animated Splash Screen      │
└────────────────────────────────────────────────────────────────────────┘
```

> **Zero Simulated Metrics Rule**: Every metric shown in PULSE originates from real Windows performance counters, CentralProcessor Registry keys, NVIDIA SMI utilities, COM/WMI interfaces, or low-overhead kernel telemetry. If a hardware vendor does not expose a sensor, PULSE reports exact status rather than fabricated data.

---

## 🎨 Visual Identity & Design System

PULSE features a technical, high-contrast dark visual identity built for clarity:

- **Application Background**: `#0D1015` (Pure Obsidian)
- **Secondary Background**: `#121720` (Dark Navy Surface)
- **Navigation Sidebar**: `#11151C`
- **Cards & Widgets**: `#181F29`
- **Elevated Surfaces**: `#202936`
- **Primary Accent**: `#00D4FF` (Pulse Cyan)
- **Secondary Accent**: `#8585FF` (Cobalt Violet)
- **Success / Nominal**: `#35D07F` (Emerald Green)
- **Warning / Degraded**: `#FFB547` (Amber Gold)
- **Critical / Danger**: `#FF5252` (Crimson Red)

---

## 🖥️ User Interface & Dashboard Showcase

### 1. Dedicated GPU Graphics & Live Telemetry Center

PULSE directly interrogates native hardware drivers to deliver instant, zero-mock performance analytics:

<p align="center">
  <a href="https://raw.githubusercontent.com/Rohanjm911/PULSE/main/docs/screenshots/gpu_dashboard.png" target="_blank">
    <img src="https://raw.githubusercontent.com/Rohanjm911/PULSE/main/docs/screenshots/gpu_dashboard.png" alt="PULSE GPU Graphics & Hardware Telemetry Dashboard" width="100%" />
  </a>
</p>

#### Functional UI Breakdown:

| Visual Element | Interface Location | Live Telemetry & Architectural Function |
| :--- | :--- | :--- |
| **Technical Sidebar** | Left Column | Categorized navigation into *Telemetry*, *System Management*, and *Modes & Analytics* with active indicator and glowing icon states. |
| **Top Status Ribbon** | Header Bar | Real-time system uptime (`14h 2m`), System Health Index (`55%`), total process count (`329`), and quick Floating HUD toggle. |
| **Engine Hero Banner** | Top Main Card | Displays hardware vendor identification (`NVIDIA`), installed display driver version, device designation, and live core load. |
| **VRAM Buffer Card** | Metrics Row (1/4) | Tracks active dedicated video memory allocation against total physical GDDR6 boundary (`8.58 GB`). |
| **GPU Thermal Card** | Metrics Row (2/4) | Direct on-die silicon thermal sensor reading with dynamic safety margin indicators. |
| **Clock Frequency Card** | Metrics Row (3/4) | Real-time Core Clock & Memory Clock frequencies in MHz alongside dynamic D3D state monitoring. |
| **Power & Fan Profile** | Metrics Row (4/4) | Live Wattage draw, active cooling profile, and hardware acceleration status. |
| **Engine Workload Area** | Center Chart | High-frequency continuous workload sampling from DirectX / WDDM kernel adapter with area gradients. |
| **Memory Allocation Bar**| Bottom Left | Visual frame-buffer bar showing active allocated video memory against physical capacity. |

---

### 2. High-Tech Animated Startup Engine

The application boots through a cinematic, distraction-free startup sequence:

<p align="center">
  <a href="https://raw.githubusercontent.com/Rohanjm911/PULSE/main/docs/screenshots/splash_screen.jpg" target="_blank">
    <img src="https://raw.githubusercontent.com/Rohanjm911/PULSE/main/docs/screenshots/splash_screen.jpg" alt="PULSE High-Tech Animated Startup Splash Screen" width="85%" />
  </a>
</p>

#### Startup Engineering & Design Principles:
- **100% Solid Pure Black (`#000000`)**: The animated core logo blends seamlessly on pure black with zero box artifacts or visible rectangular borders.
- **Dynamic Boot Status Engine**: Visually reports live kernel initialization stages:
  1. `INITIALIZING SYSTEM KERNEL PROBES...`
  2. `CONNECTING NVIDIA & CPU TELEMETRY...`
  3. `CALIBRATING HARDWARE SENSORS...`
  4. `SYSTEM READY — ALL CORES ONLINE`
- **Smart 2.0-Second Auto-Skip**: The timer smoothly advances to 100% and automatically triggers the dashboard entrance without manual intervention.
- **Instant Skip Accessibility**: Pressing `[ESC]`, `[Enter]`, `Space`, or simply clicking anywhere on screen instantly dismisses the splash sequence.
- **Cinematic Parallel Cross-Dissolve**: When boot completes, the splash screen smoothly dissolves out via a **0.7s cubic-bezier curve (`[0.16, 1, 0.3, 1]`)** while the main application dashboard blooms into view with zero dropped frames.

---

### 3. Desktop Floating HUD (Gaming & Benchmarking Mode)

A translucent, movable desktop companion that floats above games, full-screen video, and benchmarking runs:

```
┌────────────────────────────────────────────────────────┐
│  PULSE HUD // LIVE DESKTOP TELEMETRY COMPANION         │
├────────────────────────────────────────────────────────┤
│  CPU:   18%   │  3.40 GHz  │  58°C                     │
│  RAM:   64%   │  10.2 GB / 16.0 GB                     │
│  GPU:   24%   │  55°C      │  1850 MHz  │  8.58 GB     │
│  NET:   ↓ 14.2 MB/s        │  ↑ 1.8 MB/s               │
└────────────────────────────────────────────────────────┘
```

- **Non-Invasive Architecture**: Compliant with BattlEye, Easy Anti-Cheat, and Riot Vanguard with zero memory hooks or DLL injections.
- **Configurable Translucency**: Adjustable window opacity (30% to 100%) and draggable anywhere on multi-monitor setups.

---

## 📦 Complete Module Architecture

### 0. Initial Onboarding: First-Run Hardware Discovery & Baseline Calibration
- **Automated Hardware Profiling**: Runs on initial application launch across 6 discrete phases (CPU, GPU, RAM, Storage, Network, and Baseline Health).
- **Subsystem Verification**: Validates hardware counters, verifies dedicated NVIDIA GDDR6 VRAM, queries base clock speeds, and establishes initial baseline health.
- **Persistent Calibration**: Saves state locally in `localStorage` (`pulse_first_scan_completed`) so subsequent runs boot instantly into the dashboard.
- **On-Demand Re-Run**: Easily re-triggered anytime from the Diagnostics page via the dedicated "Re-Run System Scan" button.

### 1. Module 01: System Overview Dashboard
- **Health Score Algorithm**: Aggregates CPU load, memory pressure, thermal readings, and storage capacity into a dynamic 0–100 score (`Optimal`, `Good`, `Warning`, `Critical`).
- **Core Telemetry Cards**: 6 metric cards for CPU, RAM, GPU, Primary Disk, Network, and Thermals.
- **Interactive Graphs**: Real-time Apache ECharts history timelines with smooth area gradients.
- **Alert Feed**: Displays active system anomalies with one-click navigation to the alert center.

### 2. Modules 02 & 03: Advanced CPU & Memory Monitoring
- **Core Utilization Matrix**: CoreBarChart visualizer displaying utilization across every logical processor.
- **Processor Specs**: Core count, logical thread count, base clock (2.92 GHz), and dynamic clock speeds.
- **Physical Memory Breakdown**: Active working-set RAM, standby cache, and free memory.
- **Pagefile / Swap**: Dedicated virtual memory utilization tracking.
- **Top Memory Hogs**: Identifies non-system applications consuming high working-set RAM.

### 3. Module 04: GPU Monitoring (Dedicated & Integrated)
- **NVIDIA Native Telemetry**: Direct `nvidia-smi` kernel query for dedicated VRAM (8.58 GB GDDR6), 55°C real package temperature, core clock (MHz), memory clock (MHz), and driver version (`617.14`).
- **Multi-Vendor Support**: DirectX and WMI integration covering AMD Radeon and Intel Arc graphics.
- **VRAM Tracking**: Dedicated VRAM capacity and dynamic allocation metering.

### 4. Module 05: Storage Monitoring
- **Device Identification**: SSD vs. HDD media distinction across all attached fixed and removable drives.
- **Capacity Warnings**: Dynamic warning indicators when partition free space drops below 12%.
- **SMART Health Status**: Evaluates filesystem tables and disk sector states.

### 5. Module 06: Network Intelligence
- **Bandwidth Telemetry**: Live download and upload speed meters with MB/s area charts.
- **Adapter Directory**: Enumeration of active Wi-Fi, Ethernet, and virtual network adapters.
- **Connectivity State**: IPv4 connection status, MAC address, and real-time ICMP ping latency.

### 6. Module 07: Process Manager
- **Live Process Table**: PID, Executable Name, Working-Set RAM, CPU %, Disk I/O, User, and Path.
- **System Process Protection**: Critical Windows processes (`csrss.exe`, `lsass.exe`, `smss.exe`, `services.exe`, `wininit.exe`, `explorer.exe`, `dwm.exe`, etc.) are protected from accidental termination.
- **Two-Step Confirmation**: Destructive user confirmations for terminating applications.

### 7. Module 08: Startup Manager
- **Hives Enumerated**: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, `HKLM\...`, and Windows user Startup Folders.
- **Safe Toggle**: Enables or disables startup applications while preserving original execution parameters.

### 8. Modules 09 & 10: Hardware Diagnostics & Performance Insights
- **Motherboard & BIOS**: Manufacturer, product board model, serial number, BIOS firmware version, and release date.
- **CPU Capabilities**: AVX2, FMA3, AES-NI, Virtualization (VT-x/AMD-V), and SSE4.2 flags.
- **RAM Modules**: Bank labels, MT/s speed ratings, and module part numbers.
- **One-Click System Report**: Instant client-side export to formatted **PDF** (via jsPDF) and **CSV** files.

### 9. Module 11: Benchmarking Center
- **CPU Single-Thread Benchmark**: Deterministic prime sieve testing single-core throughput.
- **CPU Multi-Thread Benchmark**: Parallel thread-pool compute workload utilizing all available logical threads.
- **Memory Bandwidth Benchmark**: Sequential read/write throughput (MB/s) and memory access latency (ns).
- **Storage Benchmark**: Sequential read and write speed test using controlled temporary files (`%TEMP%\pulse_benchmark_temp.dat`).
- **History & Comparison**: Saves all benchmark runs to SQLite with JSON export.

### 10. Module 12: Gaming Mode & Desktop HUD
- **In-Game Telemetry**: Framerate readiness, frame-time latency, GPU load, and thermals.
- **Translucent Desktop HUD**: Movable, resizable, always-on-top floating monitor widget.
- **Non-Invasive Policy**: 100% compliant with BattlEye, Easy Anti-Cheat, and Riot Vanguard (zero DLL injection).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Framework** | [Tauri 2](https://v2.tauri.app/) (Native Windows container) |
| **Backend Engine** | Rust 2021 (`sysinfo`, `windows-rs`, `wmi`, `tokio`, `parking_lot`) |
| **Database** | Embedded SQLite with WAL mode (`rusqlite`) |
| **Frontend Framework**| React 19, TypeScript 6, Vite, Tailwind CSS v4 |
| **Visual Charts** | Apache ECharts (`echarts-for-react`) |
| **Motion & Transitions**| Framer Motion (Smooth cubic-bezier transitions) |
| **Icons** | Lucide React |
| **State Management** | Zustand |
| **Document Export** | jsPDF, jspdf-autotable |
| **Test Harness** | Vitest, React Testing Library, Cargo Rust test harness |

---

## 🧪 Testing & Verification

### Running Frontend Tests (Vitest)
```powershell
npm test
```
```
✓ src/utils/format.test.ts (6 tests)
✓ src/components/common/MetricBadge.test.tsx (2 tests)

Test Files  2 passed (2)
     Tests  8 passed (8)
```

### Running Backend Tests (Cargo)
```powershell
cargo test --lib --manifest-path src-tauri/Cargo.toml
```
```
running 1 test
test processes::tests::test_protected_processes ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

---

## 💻 Building from Source

### Prerequisites
- Windows 10 (22H2+) or Windows 11
- Node.js 18+ and npm
- Rust 1.75+ (Cargo)

```powershell
# 1. Install Dependencies
npm install

# 2. Run in Development Mode
npm run tauri dev

# 3. Compile Standalone Production Binary
npm run build
npm run tauri build -- --no-bundle
```

---

<p align="center">
  <strong>PULSE — Complete System Utility & Diagnostics Suite</strong><br>
  <em>Designed for Windows 10 & Windows 11</em>
</p>
