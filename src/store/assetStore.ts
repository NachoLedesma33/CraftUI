import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AssetImage {
  id: string;
  name: string;
  src: string;
  type: 'url' | 'data';
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface ProjectFont {
  id: string;
  name: string;
  family: string;
  url: string;
  category: string;
}

export interface AssetState {
  images: AssetImage[];
  palettes: ColorPalette[];
  fonts: ProjectFont[];
  projectPalette: string[];
}

export interface AssetActions {
  addImage: (image: AssetImage) => void;
  removeImage: (id: string) => void;
  addPalette: (palette: ColorPalette) => void;
  removePalette: (id: string) => void;
  setProjectPalette: (colors: string[]) => void;
  addFont: (font: ProjectFont) => void;
  removeFont: (id: string) => void;
}

type AssetStore = AssetState & AssetActions;

export const useAssetStore = create<AssetStore>()(
  persist(
    (set) => ({
      images: [],
      palettes: [],
      fonts: [],
      projectPalette: ['#8b5cf6', '#fbbf24', '#22c55e', '#ef4444', '#3b82f6', '#ec4899'],

      addImage: (image) => set((s) => ({ images: [...s.images, image] })),
      removeImage: (id) => set((s) => ({ images: s.images.filter((i) => i.id !== id) })),
      addPalette: (palette) => set((s) => ({ palettes: [...s.palettes, palette] })),
      removePalette: (id) => set((s) => ({ palettes: s.palettes.filter((p) => p.id !== id) })),
      setProjectPalette: (colors) => set({ projectPalette: colors }),
      addFont: (font) => set((s) => ({ fonts: [...s.fonts, font] })),
      removeFont: (id) => set((s) => ({ fonts: s.fonts.filter((f) => f.id !== id) })),
    }),
    {
      name: 'asset-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
