import React from "react";
import { useUIStore, useToasts } from "@/store/uiStore";
import { X } from "lucide-react";

const typeStyles: Record<string, string> = {
  success: "bg-emerald-700 border-2 border-black text-white",
  error: "bg-red-700 border-2 border-black text-white",
  info: "bg-violet-700 border-2 border-black text-white",
};

export const ToastContainer: React.FC = () => {
  const toasts = useToasts();
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 z-[200] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2.5 border shadow-brutal text-sm font-medium flex items-center gap-3 ${
            toast.exiting ? "animate-toast-out" : "animate-toast-in"
          } ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 hover:bg-black/20 rounded flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
