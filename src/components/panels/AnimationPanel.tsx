import React, { useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Zap,
  MousePointer,
  Eye,
  Trash2,
  Clock,
  Infinity as InfinityIcon,
  Settings2,
} from 'lucide-react';
import { useEditorStore, useSelectedId } from '@/store';
import type { KeyframeStep, AnimationConfig } from '@/types/canvas';

interface AnimationPreset {
  id: string;
  name: string;
  category: 'entry' | 'emphasis' | 'transform';
  animationName: string;
  duration: number;
  easing: string;
  keyframes?: KeyframeStep[];
}

const ANIMATION_PRESETS: AnimationPreset[] = [
  { id: 'fadeIn', name: 'Fade In', category: 'entry', animationName: 'fadeIn', duration: 300, easing: 'ease-out' },
  { id: 'slideInTop', name: 'Slide In Top', category: 'entry', animationName: 'slideInTop', duration: 400, easing: 'ease-out', keyframes: [{ percent: 0, properties: { opacity: '0', transform: 'translateY(-20px)' } }, { percent: 100, properties: { opacity: '1', transform: 'translateY(0)' } }] as KeyframeStep[] },
  { id: 'scaleUp', name: 'Scale Up', category: 'entry', animationName: 'scaleUp', duration: 300, easing: 'ease-out', keyframes: [{ percent: 0, properties: { opacity: '0', transform: 'scale(0.9)' } }, { percent: 100, properties: { opacity: '1', transform: 'scale(1)' } }] as KeyframeStep[] },
  { id: 'pulse', name: 'Pulse', category: 'emphasis', animationName: 'pulse', duration: 1000, easing: 'ease-in-out' },
  { id: 'bounce', name: 'Bounce', category: 'emphasis', animationName: 'bounce', duration: 600, easing: 'ease-out' },
  { id: 'shake', name: 'Shake', category: 'emphasis', animationName: 'shake', duration: 500, easing: 'ease-in-out' },
  { id: 'rotate', name: 'Rotate', category: 'transform', animationName: 'rotate', duration: 500, easing: 'ease-in-out' },
  { id: 'flip', name: 'Flip', category: 'transform', animationName: 'flip', duration: 600, easing: 'ease-in-out' },
];

const EASING_OPTIONS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'];
const TRIGGER_OPTIONS = [
  { value: 'onLoad', label: 'On Load', icon: <Eye size={14} /> },
  { value: 'onHover', label: 'On Hover', icon: <MousePointer size={14} /> },
  { value: 'inView', label: 'In View', icon: <Eye size={14} /> },
] as const;

interface PresetSelectorProps {
  onSelect: (preset: AnimationPreset) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect }) => {
  const categories = [
    { key: 'entry', label: 'Entrada', presets: ANIMATION_PRESETS.filter(p => p.category === 'entry') },
    { key: 'emphasis', label: 'Énfasis', presets: ANIMATION_PRESETS.filter(p => p.category === 'emphasis') },
    { key: 'transform', label: 'Transformación', presets: ANIMATION_PRESETS.filter(p => p.category === 'transform') },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map(cat => (
        <div key={cat.key} className="space-y-1">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{cat.label}</div>
          <div className="space-y-1">
            {cat.presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset)}
                className="w-full px-2 py-1.5 text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors text-left"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface TimeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ label, value, onChange, min = 0, max = 5000, unit = 'ms' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-secondary)]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={50}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1 bg-[var(--bg-tertiary)] appearance-none cursor-pointer"
    />
  </div>
);

interface EasingSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EasingSelector: React.FC<EasingSelectorProps> = ({ value, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs text-[var(--text-muted)] block">Easing</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-xs bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
    >
      {EASING_OPTIONS.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const AnimationPanel: React.FC = () => {
  const selectedId = useSelectedId();
  const selectedComponent = useEditorStore(s => selectedId ? s.components[selectedId] : null);
  const updateComponent = useEditorStore(s => s.updateComponent);

  const [localAnimation, setLocalAnimation] = useState<Partial<AnimationConfig>>({
    name: '',
    duration: 300,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    fillMode: 'both',
    trigger: 'onLoad',
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const handleAnimationChange = useCallback(<K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
    setLocalAnimation(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset: AnimationPreset) => {
    const newAnimation = {
      name: preset.animationName,
      duration: preset.duration,
      delay: 0,
      easing: preset.easing,
      iterations: 1,
      fillMode: 'both',
      trigger: 'onLoad',
      keyframes: preset.keyframes,
    };
    setLocalAnimation(newAnimation);
    if (!selectedComponent || !selectedId) return;
    updateComponent(selectedId, {
      styles: {
        ...selectedComponent.styles,
        animation: newAnimation,
      } as typeof selectedComponent.styles,
    });
  }, [selectedComponent, selectedId, updateComponent]);

  const playPreview = useCallback(() => {
    if (!selectedComponent || !selectedId) return;
    
    setIsPlaying(true);
    
    const animationConfig: AnimationConfig = {
      name: localAnimation.name || `anim-${selectedId}`,
      duration: localAnimation.duration || 300,
      delay: localAnimation.delay || 0,
      easing: localAnimation.easing || 'ease-out',
      iterations: localAnimation.iterations || 1,
      fillMode: (localAnimation.fillMode || 'both') as AnimationConfig['fillMode'],
      trigger: (localAnimation.trigger || 'onLoad') as AnimationConfig['trigger'],
    };
    
    updateComponent(selectedId, {
      styles: {
        ...selectedComponent.styles,
        animation: animationConfig,
      } as typeof selectedComponent.styles,
    });
    
    const totalDuration = (animationConfig.duration + (animationConfig.delay)) * (animationConfig.iterations === 'infinite' ? 1 : animationConfig.iterations);
    setTimeout(() => {
      setIsPlaying(false);
      const restored = { ...selectedComponent.styles };
      delete restored.animation;
      updateComponent(selectedId, { styles: restored as typeof selectedComponent.styles });
    }, totalDuration);
  }, [selectedComponent, selectedId, localAnimation, updateComponent]);

  const clearAnimation = useCallback(() => {
    if (!selectedComponent || !selectedId) return;
    
    const clearedStyles = { ...selectedComponent.styles };
    delete clearedStyles.animation;
    
    updateComponent(selectedId, { styles: clearedStyles });
    setLocalAnimation({
      name: '',
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      iterations: 1,
      fillMode: 'both',
      trigger: 'onLoad',
    });
  }, [selectedComponent, selectedId, updateComponent]);

  const saveToComponent = useCallback(() => {
    if (!selectedComponent || !selectedId || !localAnimation.name) return;
    
    const animationConfig: AnimationConfig = {
      name: localAnimation.name,
      duration: localAnimation.duration || 300,
      delay: localAnimation.delay || 0,
      easing: localAnimation.easing || 'ease-out',
      iterations: localAnimation.iterations || 1,
      fillMode: (localAnimation.fillMode || 'both') as AnimationConfig['fillMode'],
      trigger: (localAnimation.trigger || 'onLoad') as AnimationConfig['trigger'],
    };
    
    updateComponent(selectedId, {
      styles: {
        ...selectedComponent.styles,
        animation: animationConfig,
      } as typeof selectedComponent.styles,
    });
  }, [selectedComponent, selectedId, localAnimation, updateComponent]);

  if (!selectedComponent) return null;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Zap size={14} className="text-violet-400" />
          Animation
        </h3>
        <PresetSelector onSelect={applyPreset} />
      </div>

      <div className="space-y-3 pt-2 border-t border-[var(--border)]">
        <h4 className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
          <Clock size={12} />
          Timing
        </h4>
        
        <TimeSlider
          label="Duration"
          value={localAnimation.duration || 300}
          onChange={v => handleAnimationChange('duration', v)}
        />
        
        <TimeSlider
          label="Delay"
          value={localAnimation.delay || 0}
          onChange={v => handleAnimationChange('delay', v)}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-[var(--text-muted)]">Iterations</label>
            {localAnimation.iterations === 'infinite' ? (
              <div className="w-full px-2 py-1 text-xs bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--accent)] flex items-center gap-2">
                <InfinityIcon size={14} />
                <span>Infinite</span>
              </div>
            ) : (
              <input
                type="number"
                min={1}
                value={localAnimation.iterations || 1}
                onChange={e => handleAnimationChange('iterations', Number(e.target.value))}
                className="w-full px-2 py-1 text-xs bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-primary)]"
              />
            )}
          </div>
          <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] pt-4">
            <input
              type="checkbox"
              checked={localAnimation.iterations === 'infinite'}
              onChange={e => handleAnimationChange('iterations', e.target.checked ? 'infinite' : 1)}
            />
            <InfinityIcon size={12} />
          </label>
        </div>

        <EasingSelector
          value={localAnimation.easing || 'ease-out'}
          onChange={v => handleAnimationChange('easing', v)}
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-[var(--border)]">
        <h4 className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
          <Settings2 size={12} />
          Trigger
        </h4>
        <div className="flex gap-1">
          {TRIGGER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleAnimationChange('trigger', opt.value as AnimationConfig['trigger'])}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs transition-colors ${
                localAnimation.trigger === opt.value
                  ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
        <button
          onClick={playPreview}
          disabled={isPlaying || !localAnimation.name}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
            isPlaying
              ? 'bg-green-600 text-white'
              : 'bg-[var(--accent)] hover:bg-violet-700 text-[var(--text-primary)] disabled:opacity-50'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Playing...' : 'Preview'}
        </button>
        <button
          onClick={clearAnimation}
          className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 transition-colors"
          title="Clear Animation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <button
        onClick={saveToComponent}
        disabled={!localAnimation.name}
        className="w-full py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm transition-colors disabled:opacity-50"
      >
        Save Animation
      </button>
    </div>
  );
};