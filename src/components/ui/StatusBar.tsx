import React, { useMemo, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';

interface StatusBarProps {
  mousePosition?: { x: number; y: number } | null;
}

export const StatusBar = React.memo<StatusBarProps>(({ mousePosition }) => {
  const components = useEditorStore((s) => s.components);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const zoom = useUIStore((s) => s.view.zoom);
  const lastSaved = useUIStore((s) => s.autoSave.lastSaved);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const totalComponents = Object.keys(components).length;
    const selectedCount = selectedIds.length;
    const layersCount = Object.values(components).filter(comp =>
      comp.children.length > 0 || !comp.parent
    ).length;
    return { totalComponents, selectedCount, layersCount };
  }, [components, selectedIds]);

  const formatLastSaved = useMemo(() => {
    if (!lastSaved) return 'Never';
    const diffMs = now - lastSaved;
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return 'Just now';
    return `${Math.floor(diffSeconds / 60)}m ago`;
  }, [lastSaved, now]);

  const formatCoordinate = (val: number | undefined) => {
    if (val === undefined) return "0000.00";
    return val.toFixed(2).padStart(7, '0');
  };

  return (
    <footer className="h-8 bg-black text-white flex items-center justify-between px-6 z-50 select-none">
      <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <span className="text-[#fbbf24]">X:</span>
          <span className="w-16 tabular-nums">{formatCoordinate(mousePosition?.x)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#fbbf24]">Y:</span>
          <span className="w-16 tabular-nums">{formatCoordinate(mousePosition?.y)}</span>
        </div>
        <div className="h-4 w-px bg-white/20"></div>
        <div className="flex items-center gap-2">
          <span className="text-[#3b82f6]">ZOOM:</span>
          <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="h-4 w-px bg-white/20"></div>
        <div className="flex items-center gap-4 text-white/40">
          <span>Elems: {metrics.totalComponents}</span>
          <span>Layers: {metrics.layersCount}</span>
          {metrics.selectedCount > 0 && (
            <span className="text-[#fbbf24] font-bold">Sel: {metrics.selectedCount}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest font-medium">
        <span className="text-white/40">Saved: {formatLastSaved}</span>
        <div className="h-4 w-px bg-white/20"></div>
        <span className="text-[#ef4444] animate-pulse flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
          LIVE UPDATING
        </span>
        <div className="h-4 w-px bg-white/20"></div>
        <span>v2.4.1-STABLE</span>
      </div>
    </footer>
  );
});
