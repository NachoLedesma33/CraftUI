import React, { useState, useRef, useEffect, useCallback } from "react";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f43f5e", "#78716c", "#a8a29e", "#44403c",
  "#1c1917",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const selectColor = useCallback((color: string) => {
    onChange(color);
    setHexInput(color);
    setHistory((prev) => {
      const next = [color, ...prev.filter((c) => c !== color)].slice(0, 6);
      return next;
    });
  }, [onChange]);

  const handleHexSubmit = useCallback(() => {
    const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      selectColor(hex);
    } else {
      setHexInput(value);
    }
  }, [hexInput, value, selectColor]);

  return (
    <div className="relative" ref={pickerRef}>
      {label && (
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 border-2 border-[var(--border)] flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
          style={{ backgroundColor: value || "#000" }}
          title={value}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={handleHexSubmit}
          onKeyDown={(e) => { if (e.key === "Enter") handleHexSubmit(); }}
          className="flex-1 px-2 py-1.5 text-sm bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none font-mono"
          placeholder="#000000"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--bg-secondary)] border-2 border-[var(--border)] shadow-brutal p-3 space-y-3 animate-scale-in">
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-1.5">Presets</div>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => selectColor(color)}
                  className={`w-full aspect-square border-2 transition-transform hover:scale-110 ${
                    value === color ? "border-[var(--accent)]" : "border-[var(--border)]"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => selectColor(e.target.value)}
              className="w-full h-8 border-2 border-[var(--border)] cursor-pointer"
            />
          </div>

          {history.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-1.5">Recent</div>
              <div className="flex gap-1 flex-wrap">
                {history.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectColor(color)}
                    className="w-6 h-6 border-2 border-[var(--border)] transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
