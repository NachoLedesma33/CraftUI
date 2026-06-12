import React, { useState, useCallback, useRef } from "react";
import { useAssetStore } from "@/store/assetStore";
import type { ColorPalette } from "@/store/assetStore";
import { Plus, Trash2, Palette, Copy, Check } from "lucide-react";
import { v4 as uuid } from "uuid";

const BUILTIN_PALETTES: ColorPalette[] = [
  { id: "pal-violet", name: "Violet", colors: ["#ede9fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"] },
  { id: "pal-amber", name: "Amber", colors: ["#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309"] },
  { id: "pal-emerald", name: "Emerald", colors: ["#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857"] },
  { id: "pal-rose", name: "Rose", colors: ["#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c"] },
  { id: "pal-sky", name: "Sky", colors: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"] },
  { id: "pal-neutral", name: "Neutral", colors: ["#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c", "#44403c", "#1c1917"] },
  { id: "pal-ocean", name: "Ocean", colors: ["#ecfeff", "#a5f3fc", "#22d3ee", "#06b6d4", "#0891b2", "#0e7490", "#155e75"] },
  { id: "pal-sunset", name: "Sunset", colors: ["#fff7ed", "#fed7aa", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"] },
];

const extractColorsFromImage = (src: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve([]); return; }
      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      const colorMap = new Map<string, number>();
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
      const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      const hexColors = sorted.map(([key]) => {
        const [r, g, b] = key.split(",").map(Number);
        return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
      });
      resolve(hexColors);
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
};

interface ColorPaletteManagerProps {
  onSelect?: (color: string) => void;
}

export const ColorPaletteManager: React.FC<ColorPaletteManagerProps> = ({ onSelect }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [extracting, setExtracting] = useState(false);
  const { palettes, addPalette, removePalette, projectPalette } = useAssetStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNewPalette = useCallback(() => {
    const name = `Palette ${palettes.length + 1}`;
    const colors = [
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
    ];
    addPalette({ id: uuid(), name, colors });
  }, [palettes.length, addPalette]);

  const handleExtractFromImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setExtracting(true);
    const url = URL.createObjectURL(file);
    const colors = await extractColorsFromImage(url);
    URL.revokeObjectURL(url);
    if (colors.length > 0) {
      addPalette({ id: uuid(), name: `From ${file.name}`, colors });
    }
    setExtracting(false);
  }, [addPalette]);

  const copyPalette = useCallback((colors: string[], index: number) => {
    navigator.clipboard.writeText(colors.join(", "));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const allPalettes = [...BUILTIN_PALETTES, ...palettes];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Project Palette</div>
        </div>
        <div className="flex gap-1">
          {projectPalette.map((color, i) => (
            <button
              key={i}
              onClick={() => onSelect?.(color)}
              className="flex-1 h-7 border-2 border-black transition-transform hover:scale-110 hover:z-10 relative group"
              style={{ backgroundColor: color }}
              title={color}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono opacity-0 group-hover:opacity-100 bg-black/50 text-white">
                {color}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Palettes</div>
          <div className="flex gap-1">
            <button
              onClick={handleNewPalette}
              className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
              title="New random palette"
            >
              <Plus size={12} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)] relative"
              title="Extract from image"
              disabled={extracting}
            >
              <Palette size={12} className={extracting ? "animate-pulse" : ""} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExtractFromImage(f); }}
            />
          </div>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {allPalettes.map((palette, idx) => (
            <div key={palette.id} className="border-2 border-[var(--border)] p-1.5 group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] truncate">{palette.name}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyPalette(palette.colors, idx)}
                    className="p-0.5 hover:bg-[var(--bg-tertiary)]"
                    title="Copy colors"
                  >
                    {copiedIndex === idx ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  </button>
                  {idx >= BUILTIN_PALETTES.length && (
                    <button onClick={() => removePalette(palette.id)} className="p-0.5 hover:bg-red-500/20" title="Delete">
                      <Trash2 size={10} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5">
                {palette.colors.map((color, ci) => (
                  <button
                    key={ci}
                    onClick={() => onSelect?.(color)}
                    className="flex-1 h-5 border border-black/50 transition-transform hover:scale-110 hover:z-10"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
