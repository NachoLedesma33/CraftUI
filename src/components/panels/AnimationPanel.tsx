import React, { useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Zap,
  MousePointer,
  Eye,
  Trash2,
  Clock,
  Infinity,
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
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">{cat.label}</div>
          <div className="space-y-1">
            {cat.presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset)}
                className="w-full px-2 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-left"
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
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-300">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={50}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

interface EasingSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EasingSelector: React.FC<EasingSelectorProps> = ({ value, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs text-slate-400 block">Easing</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none"
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
    setLocalAnimation({
      name: preset.animationName,
      duration: preset.duration,
      delay: 0,
      easing: preset.easing,
      iterations: preset.category === 'emphasis' ? 1 : 1,
      fillMode: 'both',
      trigger: 'onLoad',
      keyframes: preset.keyframes,
    });
  }, []);

  const playPreview = useCallback(() => {
    if (!selectedComponent || !selectedId) return;
    
    setIsPlaying(true);
    
    const animationConfig: Partial<AnimationConfig> = {
      name: localAnimation.name || `anim-${selectedId}`,
      duration: localAnimation.duration || 300,
      delay: localAnimation.delay || 0,
      easing: localAnimation.easing || 'ease-out',
      iterations: localAnimation.iterations || 1,
      fillMode: localAnimation.fillMode || 'both',
      trigger: localAnimation.trigger || 'onLoad',
    };
    
    const styles = {
      animationName: { base: animationConfig.name! },
      animationDuration: { base: `${animationConfig.duration}ms` },
      animationDelay: { base: `${animationConfig.delay}ms` },
      animationIterationCount: { base: animationConfig.iterations === 'infinite' ? 'infinite' : String(animationConfig.iterations) },
      animationTimingFunction: { base: animationConfig.easing! },
      animationFillMode: { base: animationConfig.fillMode! },
    };
    
    updateComponent(selectedId, { styles: { ...selectedComponent.styles, ...styles } as typeof selectedComponent.styles });
    
    const totalDuration = (animationConfig.duration! + (animationConfig.delay || 0)) * (animationConfig.iterations === 'infinite' ? 1 : animationConfig.iterations!);
    setTimeout(() => {
      setIsPlaying(false);
      updateComponent(selectedId, {
        styles: {
          ...selectedComponent.styles,
          animationName: selectedComponent.styles.animationName,
        } as typeof selectedComponent.styles,
      });
    }, totalDuration);
  }, [selectedComponent, selectedId, localAnimation, updateComponent]);

  const clearAnimation = useCallback(() => {
    if (!selectedComponent || !selectedId) return;
    
    const clearedStyles = { ...selectedComponent.styles };
    delete clearedStyles.animationName;
    delete clearedStyles.animationDuration;
    delete clearedStyles.animationDelay;
    delete clearedStyles.animationIterationCount;
    delete clearedStyles.animationTimingFunction;
    delete clearedStyles.animationFillMode;
    
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
    
    const styles = {
      ...selectedComponent.styles,
      animationName: { base: localAnimation.name! },
      animationDuration: { base: `${localAnimation.duration}ms` },
      animationDelay: { base: `${localAnimation.delay}ms` },
      animationIterationCount: { base: localAnimation.iterations === 'infinite' ? 'infinite' : String(localAnimation.iterations) },
      animationTimingFunction: { base: localAnimation.easing! },
      animationFillMode: { base: localAnimation.fillMode! },
    };
    
    updateComponent(selectedId, { styles: styles as typeof selectedComponent.styles });
  }, [selectedComponent, selectedId, localAnimation, updateComponent]);

  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Select a component to edit animations
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />
          Animation
        </h3>
        <PresetSelector onSelect={applyPreset} />
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-700">
        <h4 className="text-xs font-medium text-slate-400 flex items-center gap-2">
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
            <label className="text-xs text-slate-400">Iterations</label>
            <input
              type="number"
              min={1}
              value={localAnimation.iterations === 'infinite' ? 1 : localAnimation.iterations || 1}
              onChange={e => handleAnimationChange('iterations', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200"
            />
          </div>
          <label className="flex items-center gap-1 text-xs text-slate-400 pt-4">
            <input
              type="checkbox"
              checked={localAnimation.iterations === 'infinite'}
              onChange={e => handleAnimationChange('iterations', e.target.checked ? 'infinite' : 1)}
              className="rounded"
            />
            <Infinity size={12} />
          </label>
        </div>

        <EasingSelector
          value={localAnimation.easing || 'ease-out'}
          onChange={v => handleAnimationChange('easing', v)}
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-700">
        <h4 className="text-xs font-medium text-slate-400 flex items-center gap-2">
          <Settings2 size={12} />
          Trigger
        </h4>
        <div className="flex gap-1">
          {TRIGGER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleAnimationChange('trigger', opt.value as AnimationConfig['trigger'])}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors ${
                localAnimation.trigger === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-700">
        <button
          onClick={playPreview}
          disabled={isPlaying || !localAnimation.name}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPlaying
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Playing...' : 'Preview'}
        </button>
        <button
          onClick={clearAnimation}
          className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
          title="Clear Animation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <button
        onClick={saveToComponent}
        disabled={!localAnimation.name}
        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        Save Animation
      </button>
    </div>
  );
};