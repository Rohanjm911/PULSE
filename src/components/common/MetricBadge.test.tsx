import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MetricBadge } from "./MetricBadge";

describe("MetricBadge component", () => {
  it("renders status correctly", () => {
    render(<MetricBadge status="Optimal" />);
    expect(screen.getByText("Optimal")).toBeDefined();
  });

  it("renders custom label when provided", () => {
    render(<MetricBadge status="Critical" label="ALERT" />);
    expect(screen.getByText("ALERT")).toBeDefined();
  });
});
