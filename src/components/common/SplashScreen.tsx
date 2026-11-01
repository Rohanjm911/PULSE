import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import splashGif from "@/assets/splash.gif";

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2000,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING PULSE CORE...");
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const hasFinishedRef = useRef(false);

  const completeAndExit = useRef(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setProgress(100);
    setStatusText("SYSTEM READY");
    setTimeout(() => {
      onFinishRef.current();
    }, 220);
  });

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (hasFinishedRef.current) {
        clearInterval(interval);
        return;
      }

      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStatusText("INITIALIZING SYSTEM KERNEL PROBES...");
      } else if (pct < 65) {
        setStatusText("CONNECTING NVIDIA & CPU TELEMETRY...");
      } else if (pct < 95) {
        setStatusText("CALIBRATING HARDWARE SENSORS...");
      } else {
        setStatusText("SYSTEM READY");
      }

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        completeAndExit.current();
      }
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        clearInterval(interval);
        completeAndExit.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [minDurationMs]); // Only depends on minDurationMs, NEVER resets on parent re-renders

  return (
    <motion.div
      key="pulse-splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
      }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // Buttery smooth cubic-bezier curve
      }}
      onClick={() => completeAndExit.current()}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000] text-[#F4F6F8] select-none overflow-hidden cursor-pointer"
      title="Click anywhere to skip"
    >
      {/* Top Technical Metadata */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-mono text-[#687585] tracking-widest uppercase pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
        <span>PULSE_SYS // BOOT_SEQ</span>
      </div>

      <div className="absolute top-6 right-6 text-[10px] font-mono text-[#687585] tracking-widest uppercase pointer-events-none">
        BUILD 1.0.0-PRO // 64-BIT
      </div>

      {/* Center Content Box */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 pointer-events-none">
        {/* Animated GIF Container - Pure 100% Solid Black with ZERO Box Borders */}
        <div className="relative mb-5 flex items-center justify-center bg-[#000000]">
          <img
            src={splashGif}
            alt="PULSE Startup"
            className="w-64 h-64 object-contain bg-[#000000] select-none"
          />
        </div>

        {/* Typography / Branding */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-widest text-[#F4F6F8] font-mono">
              PULSE
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#181F29] text-[#00D4FF] border border-[#293342] font-mono font-bold tracking-wider">
              CORE
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#9AA5B3] tracking-wider uppercase">
            ADVANCED SYSTEM MONITORING & TELEMETRY
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#00D4FF] tracking-wider truncate max-w-[280px]">
              {statusText}
            </span>
            <span className="text-[#F4F6F8] font-bold tabular-nums">
              {progress}%
            </span>
          </div>

          {/* Minimalist Progress Track */}
          <div className="w-full h-1.5 bg-[#121720] rounded-full overflow-hidden border border-[#293342]/60 p-px">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00D4FF] via-[#8585FF] to-[#00D4FF] rounded-full shadow-[0_0_10px_rgba(0,212,255,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footnote & Skip Tip */}
      <div className="absolute bottom-6 flex items-center justify-between w-full px-8 text-[10px] font-mono text-[#687585] pointer-events-none">
        <span>CLICK OR PRESS [ESC] TO SKIP</span>
        <span>HARDWARE LINK: ACTIVE</span>
      </div>
    </motion.div>
  );
};
