# PULSE Installation & Deployment Guide

## System Requirements
- **Operating System**: Windows 10 (Version 22H2 or higher) or Windows 11 (64-bit).
- **Architecture**: x86_64 / AMD64.
- **Privileges**: Standard user privileges for monitoring, diagnostics, and benchmarking. Administrator elevation is required only if configuring protected system startup entries or managing external device drivers.
- **Runtime**: WebView2 (built into modern Windows 10 and 11).

---

## 1. Running the Pre-Built Standalone Binary (`pulse.exe`)

PULSE is pre-compiled as an optimized native Windows executable that runs with **zero dependencies**, zero background daemons, and zero external database setup:

| Executable | File Location | Size | Launch Status |
| :--- | :--- | :--- | :--- |
| **Root Binary (Recommended)** | [`pulse.exe`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/PULSE/pulse.exe) | **~7.9 MB** | 🟢 **Ready to Run** |
| **Release Target Build** | [`src-tauri/target/release/pulse.exe`](file:///d:/projects%20and%20certificates/projects/uilities%20and%20others/PULSE/src-tauri/target/release/pulse.exe) | **~7.9 MB** | 🟢 **Optimized Release** |

```powershell
# Launch directly from PowerShell or double-click in File Explorer:
.\pulse.exe
```

### First-Time Run Flow:
1. **Startup Splash Screen**: High-fidelity pure black startup sequence with `Pulse.gif` and 2.0-second auto-skip.
2. **Initial System Calibration**: An automated 6-phase hardware audit (CPU, GPU, RAM, Storage, Network, and Baseline Health) runs once to calibrate hardware counters.
3. **Control Center Access**: Clicking "ENTER PULSE DASHBOARD" transitions directly into the full monitoring interface. Subsequent runs skip the calibration and boot straight into the dashboard.

---

## 2. Building from Source

### Step 1: Install Build Prerequisites
Ensure the following tools are installed on your Windows development environment:
1. **Node.js 18+** (`node -v`, `npm -v`)
2. **Rust & Cargo** (`cargo --version`, `rustc --version`)
3. **C++ Build Tools**: Microsoft C++ Build Tools (MSVC v143+).

### Step 2: Clone & Install Dependencies
```powershell
git clone https://github.com/Rohanjm911/PULSE.git
cd PULSE

# Install React 19 & Vite frontend dependencies
npm install
```

### Step 3: Launch in Development Mode
```powershell
npm run tauri dev
```

### Step 4: Compile Production Release Binary
```powershell
# Build frontend web assets and compile standalone release binary:
npm run build
npm run tauri build -- --no-bundle
```

The resulting standalone executable `pulse.exe` is produced at:
```
src-tauri\target\release\pulse.exe
```

---

## 3. Database Location & Backup

PULSE maintains all historical metrics, alerts, snapshots, and user preferences locally in an embedded SQLite file:

```
%APPDATA%\PULSE\pulse_data.db
```

To backup your historical telemetry and benchmarks, simply copy `pulse_data.db`. To reset the database, close PULSE and delete `pulse_data.db`; the application will regenerate fresh tables with WAL journal mode on the next launch.
