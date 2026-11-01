# PULSE Installation & Deployment Guide

## System Requirements
- **Operating System**: Windows 10 (Version 22H2 or higher) or Windows 11 (64-bit).
- **Architecture**: x86_64 / AMD64.
- **Privileges**: Standard user privileges for monitoring and diagnostics. Administrator elevation is required only if configuring protected system startup entries or managing external device drivers.
- **Runtime**: WebView2 (built into modern Windows 10 and 11).

---

## 1. Running the Pre-Built Release Binary

PULSE is pre-compiled as an optimized native Windows executable:

```powershell
# Executable Locations:
.\pulse.exe                               # Root folder
.\src-tauri\target\release\pulse.exe       # Target release folder
```

Double-click `pulse.exe` to launch the application immediately. No background daemon, Docker, or external database server installation is required; SQLite database initialization occurs automatically in `%APPDATA%\PULSE\pulse_data.db`.

---

## 2. Building from Source

### Step 1: Install Build Prerequisites
Ensure the following tools are installed on your Windows development environment:
1. **Node.js 18+** (`node -v`, `npm -v`)
2. **Rust & Cargo** (`cargo --version`, `rustc --version`)
3. **C++ Build Tools**: Microsoft C++ Build Tools or MinGW GCC toolchain.

### Step 2: Clone & Install Dependencies
```powershell
git clone <repository_url> PULSE
cd PULSE

# Install React & Vite frontend dependencies
npm install
```

### Step 3: Launch in Development Mode
```powershell
npm run tauri dev
```

### Step 4: Compile Production Release
```powershell
# Build web dist assets and compile optimized Rust release binary
npm run build
cargo build --release --manifest-path src-tauri/Cargo.toml
```

The resulting standalone executable `pulse.exe` is located at:
```
src-tauri\target\release\pulse.exe
```

---

## 3. Database Location & Backup

PULSE maintains all metrics, historical analytics, alerts, snapshots, and user preferences locally in an embedded SQLite file:

```
%APPDATA%\PULSE\pulse_data.db
```

To backup your historical telemetry and benchmarks, simply copy `pulse_data.db`. To reset the database, close PULSE and delete `pulse_data.db`; the application will regenerate fresh tables with WAL journal mode on the next launch.

