import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSystemStore } from "@/stores/useSystemStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { FloatingWidget } from "@/components/widgets/FloatingWidget";
import { SplashScreen } from "@/components/common/SplashScreen";
import { InitialSystemScan } from "@/components/onboarding/InitialSystemScan";

import { OverviewPage } from "@/pages/Overview";
import { PerformancePage } from "@/pages/Performance";
import { GpuPage } from "@/pages/GPU";
import { StoragePage } from "@/pages/Storage";
import { NetworkPage } from "@/pages/Network";
import { ProcessesPage } from "@/pages/Processes";
import { StartupPage } from "@/pages/Startup";
import { DiagnosticsPage } from "@/pages/Diagnostics";
import { BenchmarkPage } from "@/pages/Benchmark";
import { GamingPage } from "@/pages/Gaming";
import { AlertsPage } from "@/pages/Alerts";
import { AnalyticsPage } from "@/pages/Analytics";
import { SettingsPage } from "@/pages/Settings";

export default function App() {
  const { activeTab, startMonitoring, stopMonitoring, settings } =
    useSystemStore();
  const [showSplash, setShowSplash] = useState(true);
  const [showFirstRunScan, setShowFirstRunScan] = useState(false);

  const handleSplashFinish = React.useCallback(() => {
    setShowSplash(false);
    const hasCompletedFirstScan = localStorage.getItem(
      "pulse_first_scan_completed"
    );
    if (!hasCompletedFirstScan) {
      setShowFirstRunScan(true);
    }
  }, []);

  const handleFirstScanComplete = React.useCallback(() => {
    setShowFirstRunScan(false);
  }, []);

  useEffect(() => {
    const handleReRun = () => setShowFirstRunScan(true);
    window.addEventListener("pulse:rerun-scan", handleReRun);
    return () => window.removeEventListener("pulse:rerun-scan", handleReRun);
  }, []);

  useEffect(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  const renderActivePage = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage />;
      case "performance":
        return <PerformancePage />;
      case "gpu":
        return <GpuPage />;
      case "storage":
        return <StoragePage />;
      case "network":
        return <NetworkPage />;
      case "processes":
        return <ProcessesPage />;
      case "startup":
        return <StartupPage />;
      case "diagnostics":
        return <DiagnosticsPage />;
      case "benchmark":
        return <BenchmarkPage />;
      case "gaming":
        return <GamingPage />;
      case "alerts":
        return <AlertsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black text-[#F4F6F8] font-sans"
      style={
        {
          "--accent-primary": settings.accentColor || "#00D4FF",
        } as React.CSSProperties
      }
    >
      {/* Main Desktop Application Shell with Matching Cinematic Transition */}
      <motion.div
        className="flex h-screen w-screen overflow-hidden bg-[#0D1015]"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{
          opacity: showSplash ? 0 : 1,
          scale: showSplash ? 0.985 : 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main App Layout */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0D1015]">
          <Header />

          <main className="flex-1 overflow-y-auto px-6 py-5 bg-[#0D1015]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-7xl mx-auto"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Floating Desktop Widget (HUD) */}
        <FloatingWidget />
      </motion.div>

      {/* Startup Splash Screen with Smooth Transition */}
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </AnimatePresence>

      {/* First-Run Hardware Discovery & Baseline Calibration Scan */}
      <AnimatePresence>
        {showFirstRunScan && (
          <InitialSystemScan onComplete={handleFirstScanComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
