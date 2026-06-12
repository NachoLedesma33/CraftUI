import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAssetStore } from "@/store/assetStore";
import { Search, X } from "lucide-react";

interface GoogleFont {
  family: string;
  category: string;
  variant: string[];
  url: string;
}

const GOOGLE_FONTS: GoogleFont[] = [
  { family: "Inter", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
  { family: "Roboto", category: "sans-serif", variant: ["400", "500", "700"], url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" },
  { family: "Poppins", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" },
  { family: "Playfair Display", category: "serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" },
  { family: "Merriweather", category: "serif", variant: ["400", "700"], url: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" },
  { family: "Fira Code", category: "monospace", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" },
  { family: "JetBrains Mono", category: "monospace", variant: ["400", "500", "700"], url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" },
  { family: "Space Grotesk", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" },
  { family: "DM Sans", category: "sans-serif", variant: ["400", "500", "700"], url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" },
  { family: "Outfit", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" },
  { family: "Fraunces", category: "serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap" },
  { family: "Lora", category: "serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" },
  { family: "Source Sans 3", category: "sans-serif", variant: ["400", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" },
  { family: "Nunito", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" },
  { family: "Ubuntu", category: "sans-serif", variant: ["400", "500", "700"], url: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" },
  { family: "Cabin", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap" },
  { family: "Montserrat", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" },
  { family: "Open Sans", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" },
  { family: "Lato", category: "sans-serif", variant: ["400", "700"], url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" },
  { family: "Raleway", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" },
  { family: "Manrope", category: "sans-serif", variant: ["400", "500", "600", "700", "800"], url: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" },
  { family: "Bricolage Grotesque", category: "sans-serif", variant: ["400", "500", "600", "700", "800"], url: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap" },
  { family: "IBM Plex Sans", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
  { family: "Roboto Slab", category: "serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700&display=swap" },
  { family: "Work Sans", category: "sans-serif", variant: ["400", "500", "600", "700"], url: "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" },
];

const CATEGORIES = ["all", "sans-serif", "serif", "monospace"] as const;

interface FontManagerProps {
  onSelect: (family: string) => void;
  currentFamily?: string;
}

const PREVIEW_TEXT = "Aa Bb Cc 123 The quick brown fox";

const FontPreview: React.FC<{ font: GoogleFont }> = ({ font }) => {
  useEffect(() => {
    const id = `font-${font.family.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = font.url;
      document.head.appendChild(link);
    }
  }, [font]);

  return (
    <span style={{ fontFamily: `"${font.family}", ${font.category}` }}>
      {PREVIEW_TEXT}
    </span>
  );
};

export const FontManager: React.FC<FontManagerProps> = ({ onSelect, currentFamily }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { fonts, addFont, removeFont } = useAssetStore();

  const filtered = useMemo(() => {
    return GOOGLE_FONTS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (search && !f.family.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, category]);

  const handleAdd = useCallback((font: GoogleFont) => {
    addFont({
      id: `font-${font.family.replace(/\s+/g, "-")}`,
      name: font.family,
      family: font.family,
      url: font.url,
      category: font.category,
    });
    onSelect(font.family);
  }, [addFont, onSelect]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
            placeholder="Search fonts..."
          />
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-2 py-1 text-[10px] font-bold uppercase border-2 transition-colors ${
              category === cat ? "bg-[var(--accent)] text-black border-black" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map((font) => (
          <button
            key={font.family}
            onClick={() => handleAdd(font)}
            className={`w-full text-left px-2 py-2 border-2 transition-colors hover:bg-[var(--bg-tertiary)] ${
              currentFamily === font.family || fonts.some((f) => f.family === font.family)
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border)]"
            }`}
          >
            <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-0.5">{font.family}</div>
            <div className="text-[10px] text-[var(--text-muted)] mb-1">{font.category}</div>
            <div className="text-xs truncate opacity-80">
              <FontPreview font={font} />
            </div>
          </button>
        ))}
      </div>

      {fonts.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-1">Active Fonts</div>
          <div className="flex flex-wrap gap-1">
            {fonts.map((f) => (
              <div
                key={f.id}
                className={`inline-flex items-center gap-1 px-2 py-1 border-2 text-xs font-medium cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)] ${
                  currentFamily === f.family ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
                style={{ fontFamily: `"${f.family}", ${f.category}` }}
                onClick={() => onSelect(f.family)}
              >
                {f.name}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFont(f.id); }}
                  className="p-0.5 hover:bg-red-500/20 rounded"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
