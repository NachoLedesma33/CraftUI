import React, { useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';

interface StatusBarProps {
  mousePosition?: { x: number; y: number } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mousePosition }) => {
  const components = useEditorStore((s) => s.components);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const zoom = useUIStore((s) => s.view.zoom);
  const lastSaved = useUIStore((s) => s.autoSave.lastSaved);

  const metrics = useMemo(() => {
    const totalComponents = Object.keys(components).length;
    const selectedCount = selectedIds.length;

    // Count layers (components with children or at root level)
    const layersCount = Object.values(components).filter(comp =>
      comp.children.length > 0 || !comp.parent
    ).length;

    return { totalComponents, selectedCount, layersCount };
  }, [components, selectedIds]);

  const formatLastSaved = useMemo(() => {
    if (!lastSaved) return 'Never saved';

    const now = Date.now();
    const diffMs = now - lastSaved;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    if (diffSeconds > 30) return `${diffSeconds}s ago`;
    return 'Just now';
  }, [lastSaved]);

  const formatMousePosition = useMemo(() => {
    if (!mousePosition) return null;
    return `X: ${Math.round(mousePosition.x)} Y: ${Math.round(mousePosition.y)}`;
  }, [mousePosition]);

  return (
    <footer className="h-6 border-t border-slate-700 flex items-center justify-between px-3 text-xs text-slate-400 select-none" style={{ backgroundColor: 'var(--bg-primary)', borderTopColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
      <div className="flex items-center gap-4">
        <span>Components: {metrics.totalComponents}</span>
        <span>Layers: {metrics.layersCount}</span>
        {metrics.selectedCount > 0 && (
          <span>Selected: {metrics.selectedCount}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {formatMousePosition && (
          <span className="text-slate-300" style={{ color: 'var(--text-secondary)' }}>{formatMousePosition}</span>
        )}
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>Auto-saved: {formatLastSaved}</span>
      </div>
    </footer>
  );
};