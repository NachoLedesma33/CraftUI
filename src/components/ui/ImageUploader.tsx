import React, { useState, useCallback, useRef } from "react";
import { useAssetStore } from "@/store/assetStore";
import { Upload, X } from "lucide-react";
import { v4 as uuid } from "uuid";

const GENERIC_IMAGES = [
  { name: "Mountain", src: "https://picsum.photos/id/1043/400/300" },
  { name: "City", src: "https://picsum.photos/id/21/400/300" },
  { name: "Nature", src: "https://picsum.photos/id/15/400/300" },
  { name: "Abstract", src: "https://picsum.photos/id/24/400/300" },
  { name: "Tech", src: "https://picsum.photos/id/0/400/300" },
  { name: "Food", src: "https://picsum.photos/id/292/400/300" },
  { name: "Architecture", src: "https://picsum.photos/id/219/400/300" },
  { name: "Ocean", src: "https://picsum.photos/id/28/400/300" },
];

interface ImageUploaderProps {
  onSelect: (src: string) => void;
  currentSrc?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onSelect, currentSrc }) => {
  const [tab, setTab] = useState<"library" | "upload" | "url">("library");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { images, addImage, removeImage } = useAssetStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const id = uuid();
      addImage({ id, name: file.name, src: dataUrl, type: "data" });
      onSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [addImage, onSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    const id = uuid();
    addImage({ id, name: urlInput.split("/").pop() || "image", src: urlInput, type: "url" });
    onSelect(urlInput);
    setUrlInput("");
  }, [urlInput, addImage, onSelect]);

  return (
    <div className="space-y-2">
      <div className="flex border-2 border-[var(--border)] overflow-hidden">
        {(["library", "upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "bg-[var(--accent)] text-black" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            {t === "library" ? "Examples" : t === "upload" ? "Upload" : "URL"}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
          {GENERIC_IMAGES.map((img) => (
            <button
              key={img.src}
              onClick={() => onSelect(img.src)}
              className={`relative group border-2 overflow-hidden aspect-video transition-all hover:scale-105 ${
                currentSrc === img.src ? "border-[var(--accent)]" : "border-[var(--border)]"
              }`}
              title={img.name}
            >
              <img src={img.src} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {img.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--text-muted)]"
          }`}
        >
          <Upload size={24} className="mx-auto mb-1 text-[var(--text-secondary)]" />
          <p className="text-xs text-[var(--text-secondary)]">Drop an image or click to browse</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {tab === "url" && (
        <div className="flex gap-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            className="flex-1 px-2 py-1.5 text-xs bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
          <button
            onClick={handleUrlSubmit}
            className="px-3 py-1.5 bg-[var(--accent)] text-black text-xs font-bold border-2 border-black hover:opacity-90"
          >
            Add
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-1">Your Images</div>
          <div className="flex flex-wrap gap-1">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <button
                  onClick={() => onSelect(img.src)}
                  className={`w-10 h-10 border-2 overflow-hidden transition-transform hover:scale-110 ${
                    currentSrc === img.src ? "border-[var(--accent)]" : "border-[var(--border)]"
                  }`}
                >
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                </button>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
