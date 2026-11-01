# PULSE Testing Documentation

## Test Suites Overview

PULSE features a dual-layer automated test architecture covering both the **Rust native backend engine** and the **React presentation layer**.

---

## 1. Frontend Test Suite (Vitest & React Testing Library)

The frontend test suite verifies mathematical calculations, unit formatters, status colors, and React UI components.

### Test Files
- `src/utils/format.test.ts`
  - Byte conversion (`B`, `KB`, `MB`, `GB`)
  - Speed throughput formatting (`KB/s`, `MB/s`)
  - Clock frequency formatting (`MHz`, `GHz`)
  - System uptime humanization (`Xd Xh Xm`)
  - Percentage clamping and rounding
  - Status color token mapping
- `src/components/common/MetricBadge.test.tsx`
  - Rendering of status badges (Optimal, Good, Warning, Critical)
  - Custom label overrides and accessibility properties

### Running Frontend Tests
```powershell
npm test
```

**Result:**
```
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
  - Verifies that Windows system processes (e.g., `csrss.exe`, `System`, `wininit.exe`) are guarded from termination attempts.
  - Verifies that standard user applications (e.g., `notepad.exe`, `chrome.exe`) can be terminated upon explicit user confirmation.

### Running Backend Tests
```powershell
cargo test --lib --manifest-path src-tauri/Cargo.toml
```

**Result:**
```
running 1 test
test processes::tests::test_protected_processes ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

