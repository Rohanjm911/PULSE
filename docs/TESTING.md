# PULSE Testing & Verification Documentation

## Test Architecture Overview

PULSE features a dual-layer automated test architecture covering both the **Rust native backend engine** and the **React presentation layer**, alongside low-level hardware validation routines.

---

## 1. Frontend Test Suite (Vitest & React Testing Library)

The frontend test suite verifies mathematical calculations, unit formatters, CPU/GPU clock display logic, and React UI components.

### Test Files
- `src/utils/format.test.ts`
  - Byte conversion (`B`, `KB`, `MB`, `GB`)
  - Speed throughput formatting (`KB/s`, `MB/s`)
  - Clock frequency formatting (`MHz`, `GHz`) with fallback protection
  - System uptime humanization (`Xd Xh Xm`)
  - Percentage clamping and rounding
  - Status color token mapping (`Optimal`, `Good`, `Warning`, `Critical`)
- `src/components/common/MetricBadge.test.tsx`
  - Rendering of status badges
  - Custom label overrides and accessibility properties

### Running Frontend Tests
```powershell
npm test
```

**Expected Result:**
```
 RUN  v5.0.5 D:/projects and certificates/projects/uilities and others/PULSE

 ✓ src/utils/format.test.ts (6 tests)
 ✓ src/components/common/MetricBadge.test.tsx (2 tests)

 Test Files  2 passed (2)
      Tests  8 passed (8)
```

---

## 2. Backend Unit Test Suite (Cargo Test)

The Rust test suite verifies safety guardrails preventing the termination of Windows critical processes.

### Test Files
- `src-tauri/src/processes/mod.rs`
  - Verifies that Windows system processes (e.g., `csrss.exe`, `System`, `wininit.exe`, `services.exe`) are guarded from termination attempts.
  - Verifies that standard user applications (e.g., `notepad.exe`, `chrome.exe`) can be terminated upon explicit user confirmation.

### Running Backend Tests
```powershell
cargo test --lib --manifest-path src-tauri/Cargo.toml
```

**Expected Result:**
```
running 1 test
test processes::tests::test_protected_processes ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

---

## 3. Hardware Telemetry Verification

PULSE incorporates low-level hardware tests ensuring zero simulated metrics:

| Subsystem | Telemetry Source | Verification Criteria |
| :--- | :--- | :--- |
| **CPU Base Clock** | `HKLM\HARDWARE\DESCRIPTION\System\CentralProcessor\0` (`~MHz`) | Returns hardware base clock (`2918 MHz` = `2.92 GHz`) without returning 0 or "N/A". |
| **NVIDIA GPU** | `nvidia-smi --query-gpu=...` (`CREATE_NO_WINDOW`) | Extracts dedicated 8.58 GB VRAM, 55°C temperature, clocks, and driver version. |
| **ACPI Thermals** | WMI `ThermalZoneInformation` & CPU load model | ACPI Celsius readings mapped into package thermals. |
| **Disk SMART** | Windows Storage Management API | Detects SSD/HDD media types and partitions. |
| **Network** | Windows IP Helper & Sysinfo Delta | Inbound/Outbound delta speedometers and ICMP ping latency. |
