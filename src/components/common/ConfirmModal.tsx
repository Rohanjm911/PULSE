import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Smooth Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Smooth Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl bg-[#181F29] border border-[#293342] p-6 shadow-2xl relative z-10"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-[#9AA5B3] hover:text-[#F4F6F8] p-1 rounded-lg hover:bg-[#202936] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  isDestructive
                    ? "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/25"
                    : "bg-[#FFB547]/10 text-[#FFB547] border border-[#FFB547]/25"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F4F6F8]">{title}</h3>
                <p className="text-xs text-[#9AA5B3] mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#293342]">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#202936] border border-[#293342] transition-colors cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer ${
                  isDestructive
                    ? "bg-[#FF5252] hover:bg-[#FF5252]/90 text-white"
                    : "bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0D1015]"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
