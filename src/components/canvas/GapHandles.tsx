import React, { useState, useRef, useEffect, useMemo } from "react";
import { useEditorStore } from "@/store";

interface GapHandlesProps {
  componentId: string;
  isSelected: boolean;
}

interface GapHandle {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const GapHandles: React.FC<GapHandlesProps> = ({
  componentId,
  isSelected,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const [tick, setTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startGap: number;
    startMouse: number;
    dir: "horizontal" | "vertical";
  } | null>(null);

  const display = (component?.styles.display?.base ?? "block") as string;
  const isFlex = display === "flex" || display === "inline-flex";
  const hasChildren = component && component.children.length > 1;

  // Poll DOM positions via RAF-based tick
  useEffect(() => {
    if (!isSelected || !isFlex || !hasChildren) return;
    let rafId: number;
    let last = 0;
    const loop = (time: number) => {
      if (time - last > 100) {
        setTick((t) => t + 1);
        last = time;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isSelected, isFlex, hasChildren]);

  // Re-compute handles on tick, selection, or gap change
  const handles = useMemo((): GapHandle[] => {
    if (!isSelected || !component || !isFlex || !hasChildren) return [];

    const el = document.querySelector<HTMLElement>(
      `[data-component-id="${componentId}"]`,
    );
    if (!el) return [];

    const children = component.children
      .map((id) =>
        el.querySelector<HTMLElement>(`[data-component-id="${id}"]`),
      )
      .filter(Boolean) as HTMLElement[];

    if (children.length < 2) return [];

    const dir = (component.styles.flexDirection?.base as string) || "row";
    const isRow = dir === "row" || dir === "row-reverse";
    const elRect = el.getBoundingClientRect();

    const result: GapHandle[] = [];
    for (let i = 0; i < children.length - 1; i++) {
      const a = children[i].getBoundingClientRect();
      const b = children[i + 1].getBoundingClientRect();

      if (isRow) {
        const g = b.left - a.right;
        if (g <= 0) continue;
        result.push({
          index: i,
          x: a.right - elRect.left,
          y: 0,
          w: g,
          h: elRect.height,
        });
      } else {
        const g = b.top - a.bottom;
        if (g <= 0) continue;
        result.push({
          index: i,
          x: 0,
          y: a.bottom - elRect.top,
          w: elRect.width,
          h: g,
        });
      }
    }

    return result;
  }, [componentId, isSelected, component, isFlex, hasChildren, tick]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const delta =
        d.dir === "horizontal"
          ? e.clientX - d.startMouse
          : e.clientY - d.startMouse;
      const newGap = Math.max(0, d.startGap + delta);
      const store = useEditorStore.getState();
      const comp = store.components[componentId];
      if (!comp) return;
      store.updateComponent(componentId, {
        styles: { ...comp.styles, gap: { base: `${Math.round(newGap)}px` } },
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      useEditorStore.getState().saveToHistory();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [componentId, isDragging]);

  if (!isSelected || !isFlex || !hasChildren || handles.length === 0)
    return null;

  const dir = (component?.styles.flexDirection?.base as string) || "row";
  const isRow = dir === "row" || dir === "row-reverse";
  const gap = parseInt(component?.styles.gap?.base ?? "0") || 0;

  return (
    <>
      {handles.map((h) => {
        const cx = h.x + (isRow ? h.w / 2 : 0);
        const cy = h.y + (isRow ? 0 : h.h / 2);
        const hs = isRow
          ? { w: Math.max(8, gap), h: 20 }
          : { w: 20, h: Math.max(8, gap) };
        return (
          <div
            key={h.index}
            className="absolute z-40 bg-violet-400/30 border border-violet-500/60 hover:bg-violet-400/50 transition-colors pointer-events-auto"
            style={{
              left: isRow ? cx - hs.w / 2 : cx - hs.w / 2 + h.w / 2,
              top: isRow ? cy - hs.h / 2 + h.h / 2 : cy - hs.h / 2,
              width: hs.w,
              height: hs.h,
              borderRadius: 2,
              cursor: isRow ? "col-resize" : "row-resize",
            }}
            title={`Gap: ${gap}px`}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const curGap =
                parseInt(component?.styles.gap?.base ?? "0") || 0;
              dragRef.current = {
                startGap: curGap,
                startMouse: isRow ? e.clientX : e.clientY,
                dir: isRow ? "horizontal" : "vertical",
              };
              setIsDragging(true);
            }}
          />
        );
      })}
    </>
  );
};
