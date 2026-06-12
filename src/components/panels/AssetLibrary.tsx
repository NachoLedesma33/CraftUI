import React, { useState, useCallback } from "react";
import { useAssetStore } from "@/store/assetStore";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { IconBrowser } from "@/components/ui/IconBrowser";
import { FontManager } from "@/components/ui/FontManager";
import { ColorPaletteManager } from "@/components/ui/ColorPaletteManager";
import { useEditorStore } from "@/store";
import { Image, Type, Palette, Grid3x3 } from "lucide-react";

type AssetTab = "images" | "icons" | "fonts" | "palettes";

const TABS: { id: AssetTab; label: string; icon: React.ReactNode }[] = [
  { id: "images", label: "Images", icon: <Image size={14} /> },
  { id: "icons", label: "Icons", icon: <Grid3x3 size={14} /> },
  { id: "fonts", label: "Fonts", icon: <Type size={14} /> },
  { id: "palettes", label: "Palettes", icon: <Palette size={14} /> },
];

export const AssetLibrary: React.FC = () => {
  const [tab, setTab] = useState<AssetTab>("images");
  const { images, fonts, palettes } = useAssetStore();

  const handleImageSelect = useCallback((src: string) => {
    const id = useEditorStore.getState().addComponent("root", "image", { src });
    setTimeout(() => useEditorStore.getState().selectComponent(id), 50);
  }, []);

  const handleIconSelect = useCallback((iconName: string) => {
    const id = useEditorStore.getState().addComponent("root", "icon", { iconName });
    setTimeout(() => useEditorStore.getState().selectComponent(id), 50);
  }, []);

  const handleFontSelect = useCallback((family: string) => {
    const selectedIds = useEditorStore.getState().selectedIds;
    if (selectedIds.length > 0) {
      const comp = useEditorStore.getState().components[selectedIds[0]];
      if (comp) {
        useEditorStore.getState().updateComponent(selectedIds[0], {
          styles: { ...comp.styles, fontFamily: { base: family } },
        });
      }
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex border-b-2 border-[var(--border)]" style={{ backgroundColor: "var(--bg-secondary)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${tab === t.id
                ? "text-[var(--bg-primary)] bg-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-tertiary)]"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {tab === "images" && (
          <ImageUploader onSelect={handleImageSelect} />
        )}

        {tab === "icons" && (
          <IconBrowser onSelect={handleIconSelect} />
        )}

        {tab === "fonts" && (
          <FontManager onSelect={handleFontSelect} />
        )}

        {tab === "palettes" && (
          <ColorPaletteManager onSelect={(color) => {
            const selectedIds = useEditorStore.getState().selectedIds;
            if (selectedIds.length > 0) {
              const comp = useEditorStore.getState().components[selectedIds[0]];
              if (comp) {
                useEditorStore.getState().updateComponent(selectedIds[0], {
                  styles: { ...comp.styles, backgroundColor: { base: color } },
                });
              }
            }
          }} />
        )}
      </div>

      <div className="px-3 py-2 border-t-2 border-[var(--border)] text-[10px] text-[var(--text-muted)]">
        <span>{images.length} images</span>
        <span className="mx-1">·</span>
        <span>{fonts.length} fonts</span>
        <span className="mx-1">·</span>
        <span>{palettes.length + 8} palettes</span>
      </div>
    </div>
  );
};
