import React, { useState, useMemo } from "react";
import { useEditorStore } from "@/store";
import type { AnimationConfig, KeyframeStep } from "@/types/canvas";
import {
  ANIMATION_PRESETS,
  EASING_OPTIONS,
  ANIMATION_TRIGGERS,
} from "@/constants/animationPresets";
import {
  generateAnimationName,
  generateAnimationCSS,
  applyAnimationPreview,
} from "@/utils/animation/animationGenerator";
import { Play, Trash2, Plus, X } from "lucide-react";

const INPUT_CLASSES =
  "w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none";
const LABEL_CLASSES = "text-xs text-slate-400 mb-1 block font-medium";
const BUTTON_CLASS =
  "px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-slate-600";
const BUTTON_OUTLINE =
  "px-2 py-1 text-xs rounded border border-slate-600 hover:bg-slate-700 text-slate-200 transition-colors";

interface PresetSelectorProps {
  onSelect: (presetId: string) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect }) => {
  const categories = ["entrada", "énfasis", "transformación"] as const;
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("entrada");

  const filteredPresets = useMemo(
    () =>
      Object.values(ANIMATION_PRESETS).filter(
        (preset) => preset.category === activeCategory,
      ),
    [activeCategory],
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className="p-2 text-xs rounded border border-slate-600 hover:bg-slate-600 text-slate-200 text-left transition-colors"
          >
            <div className="font-medium">{preset.label}</div>
            <div className="text-slate-400 text-xs">{preset.duration}ms</div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface PropertySliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const PropertySlider: React.FC<PropertySliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASSES}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-slate-700 rounded appearance-none cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${INPUT_CLASSES} w-20`}
        />
        <span className="text-xs text-slate-400 w-8">{unit}</span>
      </div>
    </div>
  );
};

interface EasingSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EasingSelector: React.FC<EasingSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASSES}>Easing (Timing Function)</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASSES}
      >
        {EASING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TriggerSelectorProps {
  value: "onLoad" | "onHover" | "inView";
  onChange: (value: "onLoad" | "onHover" | "inView") => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASSES}>Activador</label>
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as "onLoad" | "onHover" | "inView")
        }
        className={INPUT_CLASSES}
      >
        {ANIMATION_TRIGGERS.map((trigger) => (
          <option key={trigger.value} value={trigger.value}>
            {trigger.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface IterationsInputProps {
  value: number | "infinite";
  onChange: (value: number | "infinite") => void;
}

const IterationsInput: React.FC<IterationsInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASSES}>Iteraciones</label>
      <div className="flex gap-1">
        <input
          type="number"
          min="1"
          value={value === "infinite" ? 1 : value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={value === "infinite"}
          className={`${INPUT_CLASSES} flex-1 disabled:opacity-50`}
        />
        <button
          onClick={() => onChange(value === "infinite" ? 1 : "infinite")}
          className={`${BUTTON_OUTLINE} ${value === "infinite" ? "bg-blue-600 border-blue-600 text-white" : ""}`}
        >
          {value === "infinite" ? "∞" : "Fin"}
        </button>
      </div>
    </div>
  );
};

interface KeyframeEditorProps {
  keyframes: KeyframeStep[];
  onChange: (keyframes: KeyframeStep[]) => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  keyframes,
  onChange,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addKeyframe = () => {
    const lastPercent =
      keyframes.length > 0 ? keyframes[keyframes.length - 1].percent : 0;
    const newStep: KeyframeStep = {
      percent: Math.min(lastPercent + 20, 100),
      properties: { opacity: "1", transform: "scale(1)" },
    };
    onChange([...keyframes, newStep]);
  };

  const removeKeyframe = (index: number) => {
    if (keyframes.length > 2) {
      onChange(keyframes.filter((_, i) => i !== index));
    }
  };

  const updateKeyframe = (index: number, updates: Partial<KeyframeStep>) => {
    const updated = [...keyframes];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const updateProperty = (
    index: number,
    propKey: string,
    propValue: string,
  ) => {
    const updated = [...keyframes];
    updated[index].properties = {
      ...updated[index].properties,
      [propKey]: propValue,
    };
    onChange(updated);
  };

  const removeProperty = (index: number, propKey: string) => {
    const updated = [...keyframes];
    const { [propKey]: _, ...rest } = updated[index].properties;
    updated[index].properties = rest;
    onChange(updated);
  };

  return (
    <div className="space-y-2 bg-slate-800 rounded p-2">
      <div className="flex items-center justify-between">
        <label className={LABEL_CLASSES}>Keyframes</label>
        <button
          onClick={addKeyframe}
          className={`${BUTTON_CLASS} flex items-center gap-1`}
        >
          <Plus size={12} />
          Agregar
        </button>
      </div>

      <div className="space-y-1">
        {keyframes.map((step, idx) => (
          <div
            key={idx}
            className="border border-slate-700 rounded bg-slate-900 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === idx ? null : idx)
              }
              className="w-full px-2 py-1 flex items-center justify-between hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-medium text-slate-300">
                {step.percent}% - {Object.keys(step.properties).length} props
              </span>
              <span className="text-xs text-slate-400">
                {expandedIndex === idx ? "▼" : "▶"}
              </span>
            </button>

            {expandedIndex === idx && (
              <div className="border-t border-slate-700 p-2 space-y-2 bg-slate-850">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block">
                    Posición (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={step.percent}
                    onChange={(e) =>
                      updateKeyframe(idx, {
                        percent: Math.max(
                          0,
                          Math.min(100, Number(e.target.value)),
                        ),
                      })
                    }
                    className={INPUT_CLASSES}
                  />
                </div>

                <div className="border-t border-slate-700 pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">
                      Propiedades
                    </label>
                    {Object.keys(step.properties).length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            updateProperty(idx, e.target.value, "");
                            e.target.value = "";
                          }
                        }}
                        className={`${INPUT_CLASSES} text-xs`}
                        defaultValue=""
                      >
                        <option value="">Añadir propiedad...</option>
                        <option value="opacity">opacity</option>
                        <option value="transform">transform</option>
                        <option value="color">color</option>
                        <option value="backgroundColor">backgroundColor</option>
                        <option value="scale">scale</option>
                        <option value="rotate">rotate</option>
                      </select>
                    )}
                  </div>

                  {Object.entries(step.properties).map(
                    ([propKey, propValue]) => (
                      <div
                        key={propKey}
                        className="flex items-center gap-1 mb-1"
                      >
                        <span className="text-xs text-slate-400 w-20">
                          {propKey}
                        </span>
                        <input
                          type="text"
                          value={propValue}
                          onChange={(e) =>
                            updateProperty(idx, propKey, e.target.value)
                          }
                          className={`${INPUT_CLASSES} flex-1 text-xs`}
                          placeholder="value"
                        />
                        <button
                          onClick={() => removeProperty(idx, propKey)}
                          className="p-1 hover:bg-red-600/20 rounded transition-colors"
                        >
                          <X size={12} className="text-red-400" />
                        </button>
                      </div>
                    ),
                  )}
                </div>

                {Object.keys(step.properties).length === 0 && (
                  <button
                    onClick={() => updateProperty(idx, "opacity", "1")}
                    className={`${BUTTON_OUTLINE} w-full text-xs`}
                  >
                    Añadir Primera Propiedad
                  </button>
                )}

                {keyframes.length > 2 && (
                  <button
                    onClick={() => removeKeyframe(idx)}
                    className="w-full px-2 py-1 text-xs rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    Eliminar Keyframe
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnimationPanel: React.FC = () => {
  const selectedId = useEditorStore((state) => state.selectedIds[0]);
  const selectedComponent = useEditorStore((state) =>
    selectedId ? state.components[selectedId] : null,
  );
  const updateComponent = useEditorStore((state) => state.updateComponent);

  const [isPreviewRunning, setIsPreviewRunning] = useState(false);

  const currentAnimation = selectedComponent?.styles.animation;

  const handleAnimationChange = (updates: Partial<AnimationConfig>) => {
    if (!selectedComponent) return;

    const animation: AnimationConfig = {
      name:
        updates.name ||
        currentAnimation?.name ||
        generateAnimationName(selectedComponent.id, "custom"),
      duration: updates.duration ?? currentAnimation?.duration ?? 600,
      delay: updates.delay ?? currentAnimation?.delay ?? 0,
      easing: updates.easing ?? currentAnimation?.easing ?? "ease-out",
      iterations: updates.iterations ?? currentAnimation?.iterations ?? 1,
      fillMode: updates.fillMode ?? currentAnimation?.fillMode ?? "forwards",
      trigger: updates.trigger ?? currentAnimation?.trigger ?? "onLoad",
      keyframes: updates.keyframes ?? currentAnimation?.keyframes ?? [],
    };

    updateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        animation,
      },
    });
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = ANIMATION_PRESETS[presetId];
    if (!preset) return;

    handleAnimationChange({
      duration: preset.duration,
      easing: preset.easing,
      keyframes: preset.keyframes,
    });
  };

  const playPreview = async () => {
    if (!selectedComponent || !currentAnimation) return;

    setIsPreviewRunning(true);

    try {
      const element = document.querySelector(
        `[data-component-id="${selectedComponent.id}"]`,
      ) as HTMLElement | null;

      if (!element) {
        console.warn("Element not found for preview");
        setIsPreviewRunning(false);
        return;
      }

      const animationCSS = generateAnimationCSS(currentAnimation);

      await applyAnimationPreview(
        element,
        currentAnimation,
        animationCSS.keyframesCSS,
      );
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setIsPreviewRunning(false);
    }
  };

  const clearAnimation = () => {
    if (!selectedComponent) return;

    const newStyles = { ...selectedComponent.styles };
    delete newStyles.animation;

    updateComponent(selectedComponent.id, {
      styles: newStyles,
    });
  };

  if (!selectedComponent) {
    return (
      <div className="p-4 text-xs text-slate-400 text-center">
        Selecciona un componente para editar animaciones
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Selector de Presets */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Efecto
        </h3>
        <PresetSelector onSelect={handlePresetSelect} />
      </div>

      {/* Configuración de Tiempos */}
      {currentAnimation && (
        <>
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Configuración
            </h3>
            <div className="space-y-3">
              <PropertySlider
                label="Duración (ms)"
                value={currentAnimation.duration}
                min={100}
                max={5000}
                step={100}
                unit="ms"
                onChange={(value) => handleAnimationChange({ duration: value })}
              />

              <PropertySlider
                label="Delay (ms)"
                value={currentAnimation.delay}
                min={0}
                max={5000}
                step={100}
                unit="ms"
                onChange={(value) => handleAnimationChange({ delay: value })}
              />

              <IterationsInput
                value={currentAnimation.iterations}
                onChange={(value) =>
                  handleAnimationChange({ iterations: value })
                }
              />

              <EasingSelector
                value={currentAnimation.easing}
                onChange={(value) => handleAnimationChange({ easing: value })}
              />

              <TriggerSelector
                value={currentAnimation.trigger}
                onChange={(value) => handleAnimationChange({ trigger: value })}
              />
            </div>
          </div>

          {/* Editor de Keyframes */}
          <div className="border-t border-slate-700 pt-4">
            <KeyframeEditor
              keyframes={currentAnimation.keyframes || []}
              onChange={(keyframes) => handleAnimationChange({ keyframes })}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <button
              onClick={playPreview}
              disabled={isPreviewRunning}
              className={`${BUTTON_CLASS} flex-1 flex items-center justify-center gap-1`}
            >
              <Play size={14} />
              {isPreviewRunning ? "Reproduciendo..." : "Reproducir"}
            </button>
            <button
              onClick={clearAnimation}
              className={`${BUTTON_OUTLINE} flex-1 flex items-center justify-center gap-1`}
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        </>
      )}

      {!currentAnimation && (
        <div className="text-center py-4 text-slate-400">
          <p className="text-xs mb-2">Selecciona un efecto para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default AnimationPanel;
