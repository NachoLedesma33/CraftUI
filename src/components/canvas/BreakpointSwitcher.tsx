import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, Settings } from "lucide-react";
import { useUIStore } from "@/store";
import type { Breakpoint } from "@/types/canvas";
import { BreakpointManager } from "@/components/panels/BreakpointManager";

const defaultBps: { id: Breakpoint; label: string; icon: React.ReactNode; width: string }[] = [
  { id: "base", label: "Mobile", icon: <Smartphone size={14} />, width: "375px" },
  { id: "tablet", label: "Tablet", icon: <Tablet size={14} />, width: "768px" },
  { id: "desktop", label: "Desktop", icon: <Monitor size={14} />, width: "1280px" },
];

const breakpointToDevice: Record<string, 'mobile' | 'tablet' | 'desktop'> = {
  base: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
};

export const BreakpointSwitcher: React.FC = () => {
  const activeBreakpoint = useUIStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useUIStore((s) => s.setActiveBreakpoint);
  const setActiveDevice = useUIStore((s) => s.setActiveDevice);
  const customBreakpoints = useUIStore((s) => s.customBreakpoints);
  const [showManager, setShowManager] = useState(false);

  const allBreakpoints = [
    ...defaultBps,
    ...customBreakpoints.map((bp) => ({
      id: bp.id as Breakpoint,
      label: bp.name,
      icon: (
        <span className="text-[10px] font-mono font-bold">
          {bp.name.charAt(0).toUpperCase()}
        </span>
      ),
      width: `${bp.width}px`,
    })),
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-0.5 bg-[var(--bg-tertiary)] border-2 border-[var(--border)]">
        {allBreakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => {
              setActiveBreakpoint(bp.id);
              const device = breakpointToDevice[bp.id];
              if (device) setActiveDevice(device);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
              activeBreakpoint === bp.id
                ? "bg-[var(--accent)] text-black border-r-2 border-black"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            }`}
            title={`Edit ${bp.label} (${bp.width})`}
          >
            {bp.icon}
            <span className="hidden sm:inline">{bp.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowManager(!showManager)}
          className={`px-2 py-1.5 text-[11px] transition-colors ${
            showManager
              ? "bg-[var(--accent)] text-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Manage breakpoints"
        >
          <Settings size={12} />
        </button>
      </div>

      {showManager && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--bg-secondary)] border-2 border-[var(--border)] shadow-brutal">
          <BreakpointManager />
        </div>
      )}
    </div>
  );
};
