import React, { useCallback } from "react";
import { useEditorStore } from "@/store";
import type { Styles } from "@/types/canvas";

interface AutoLayoutToolbarProps {
  componentId: string;
}

const DIRECTION_ICONS: Record<string, string> = {
  row: "→",
  column: "↓",
  "row-reverse": "←",
  "column-reverse": "↑",
};

const JUSTIFY_OPTIONS = [
  { value: "flex-start", label: "⤪" },
  { value: "center", label: "⤫" },
  { value: "flex-end", label: "⤭" },
  { value: "space-between", label: "⇔" },
  { value: "space-around", label: "≣" },
];

const ALIGN_OPTIONS = [
  { value: "stretch", label: "⇕" },
  { value: "flex-start", label: "⊤" },
  { value: "center", label: "⫼" },
  { value: "flex-end", label: "⊥" },
];

export const AutoLayoutToolbar: React.FC<AutoLayoutToolbarProps> = ({
  componentId,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);

  const styles = component?.styles;
  const display = (styles?.display?.base ?? "block") as string;
  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid";
  const direction =
    (styles?.flexDirection?.base as string) || (isFlex ? "row" : "");
  const gap = (styles?.gap?.base as string) || "0";
  const justify = (styles?.justifyContent?.base as string) || "flex-start";
  const align = (styles?.alignItems?.base as string) || "stretch";
  const wrap = (styles?.flexWrap?.base as string) || "nowrap";

  const updateStyle = useCallback(
    (key: keyof Styles, value: string) => {
      if (!styles) return;
      const newStyles = {
        ...styles,
        [key]: { base: value },
      };
      updateComponent(componentId, { styles: newStyles });
    },
    [styles, componentId, updateComponent],
  );

  const cycleDirection = useCallback(() => {
    const order = ["row", "column", "row-reverse", "column-reverse"];
    const idx = order.indexOf(direction);
    const next = order[(idx + 1) % order.length];
    updateStyle("flexDirection", next);
    saveToHistory();
  }, [direction, updateStyle, saveToHistory]);

  const handleGapChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      updateStyle("gap", `${val}px`);
    },
    [updateStyle],
  );

  const handleGapBlur = useCallback(() => {
    saveToHistory();
  }, [saveToHistory]);

  const setJustify = useCallback(
    (value: string) => {
      updateStyle("justifyContent", value);
      saveToHistory();
    },
    [updateStyle, saveToHistory],
  );

  const setAlign = useCallback(
    (value: string) => {
      updateStyle("alignItems", value);
      saveToHistory();
    },
    [updateStyle, saveToHistory],
  );

  const toggleWrap = useCallback(() => {
    updateStyle("flexWrap", wrap === "nowrap" ? "wrap" : "nowrap");
    saveToHistory();
  }, [wrap, updateStyle, saveToHistory]);

  if (!component || !styles) return null;
  if (!isFlex && !isGrid) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center gap-0.5 bg-[var(--bg-primary)] border-b-2 border-black px-1 py-0.5 text-xs pointer-events-auto w-full">
        {/* Direction toggle */}
        <button
          onClick={cycleDirection}
          className="hover:bg-[var(--bg-tertiary)] px-1 py-0.5 border border-black/20 font-mono"
          title={`Flex direction: ${direction}`}
        >
          {DIRECTION_ICONS[direction] || "→"}
        </button>

        <div className="w-px h-4 bg-black/20" />

        {/* Gap */}
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] text-[var(--text-muted)]">gap</span>
          <input
            type="number"
            value={parseInt(gap) || 0}
            onChange={handleGapChange}
            onBlur={handleGapBlur}
            className="w-8 bg-[var(--bg-secondary)] border border-black/20 px-0.5 py-0 text-[10px] text-center outline-none"
            min={0}
            max={100}
          />
          <span className="text-[10px] text-[var(--text-muted)]">px</span>
        </div>

        <div className="w-px h-4 bg-black/20" />

        {/* Justify */}
        {JUSTIFY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setJustify(opt.value)}
            className={`px-1 py-0.5 border font-mono text-[11px] ${
              justify === opt.value
                ? "bg-violet-500 text-white border-violet-500"
                : "hover:bg-[var(--bg-tertiary)] border-black/20"
            }`}
            title={`Justify: ${opt.value}`}
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-4 bg-black/20" />

        {/* Align */}
        {ALIGN_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAlign(opt.value)}
            className={`px-1 py-0.5 border font-mono text-[11px] ${
              align === opt.value
                ? "bg-violet-500 text-white border-violet-500"
                : "hover:bg-[var(--bg-tertiary)] border-black/20"
            }`}
            title={`Align: ${opt.value}`}
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-4 bg-black/20" />

        {/* Wrap toggle */}
        <button
          onClick={toggleWrap}
          className={`px-1 py-0.5 border font-mono text-[10px] ${
            wrap === "wrap"
              ? "bg-violet-500 text-white border-violet-500"
              : "hover:bg-[var(--bg-tertiary)] border-black/20"
          }`}
          title={`Wrap: ${wrap}`}
        >
          ↻
        </button>
      </div>
    </div>
  );
};
