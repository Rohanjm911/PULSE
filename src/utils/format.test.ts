import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatSpeed,
  formatFrequency,
  formatUptime,
  formatPercent,
  getStatusColor,
} from "./format";

describe("Formatting utilities", () => {
  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(1024 * 1024 * 1024 * 2.5)).toBe("2.5 GB");
  });

  it("formats network speeds correctly", () => {
    expect(formatSpeed(0)).toBe("0 KB/s");
    expect(formatSpeed(1024 * 500)).toBe("500.0 KB/s");
    expect(formatSpeed(1024 * 1024 * 12)).toBe("12.0 MB/s");
  });

  it("formats processor frequency correctly", () => {
    expect(formatFrequency(0)).toBe("N/A");
    expect(formatFrequency(800)).toBe("800 MHz");
    expect(formatFrequency(3400)).toBe("3.40 GHz");
  });

  it("formats uptime correctly", () => {
    expect(formatUptime(45)).toBe("0m");
    expect(formatUptime(3600)).toBe("1h 0m");
    expect(formatUptime(90000)).toBe("1d 1h 0m");
  });

  it("clamps and formats percentages", () => {
    expect(formatPercent(45.6)).toBe("46%");
    expect(formatPercent(120)).toBe("100%");
    expect(formatPercent(-10)).toBe("0%");
  });

  it("returns proper status colors", () => {
    expect(getStatusColor("Optimal")).toBe("text-[#35D07F]");
    expect(getStatusColor("Warning")).toBe("text-[#FFB547]");
    expect(getStatusColor("Critical")).toBe("text-[#FF5252]");
  });
});

