import React, { useState, useCallback, useMemo } from 'react';
import type { ResponsiveValue } from '@/types/canvas';

export type InputType = 'text' | 'number' | 'color' | 'select' | 'range';
export type Breakpoint = 'base' | 'tablet' | 'desktop';

export interface StyleInputProps {
  label: string;
  value: string | number | ResponsiveValue<string | number> | undefined;
  type: InputType;
  units?: string[];
  options?: { label: string; value: string }[];
  onChange: (value: string | number | ResponsiveValue<string | number>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  description?: string;
}

const breakpointIcons: Record<Breakpoint, string> = {
  base: '📱',
  tablet: '📐',
  desktop: '💻',
};

const breakpointLabels: Record<Breakpoint, string> = {
  base: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

const BreakpointTabs: React.FC<{
  active: Breakpoint;
  onSelect: (bp: Breakpoint) => void;
  values?: ResponsiveValue<unknown>;
}> = ({ active, onSelect, values }) => {
  const breakpoints: Breakpoint[] = ['base', 'tablet', 'desktop'];
  
  return (
    <div className="flex gap-0.5">
      {breakpoints.map((bp) => {
        const hasValue = values ? (bp === 'base' ? values.base : bp === 'tablet' ? values.tablet : values.desktop) : true;
        return (
          <button
            key={bp}
            type="button"
            onClick={() => onSelect(bp)}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              active === bp
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            } ${!hasValue ? 'opacity-50' : ''}`}
            title={breakpointLabels[bp]}
          >
            {breakpointIcons[bp]}
          </button>
        );
      })}
    </div>
  );
};

const UnitSelector: React.FC<{
  units: string[];
  value: string;
  onChange: (unit: string) => void;
}> = ({ units, value, onChange }) => {
  const [currentUnit, setCurrentUnit] = useState(() => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const unit = value.replace(String(numValue), '');
      return units.includes(unit) ? unit : units[0];
    }
    return units[0];
  });

  const handleChange = (newUnit: string) => {
    setCurrentUnit(newUnit);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newValue = `${numValue}${newUnit}`;
      onChange(newValue);
    }
  };

  return (
    <select
      value={currentUnit}
      onChange={(e) => handleChange(e.target.value)}
      className="px-1 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 focus:border-blue-500 focus:outline-none"
    >
      {units.map((unit) => (
        <option key={unit} value={unit}>{unit}</option>
      ))}
    </select>
  );
};

const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        type="button"
        className="w-8 h-8 rounded border-2 border-slate-600 cursor-pointer"
        style={{ backgroundColor: value || '#ffffff' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Click to pick color"
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 border border-slate-700 rounded shadow-lg z-50">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 h-32 cursor-pointer"
          />
          <div className="mt-2 flex gap-1">
            {['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((c) => (
              <button
                key={c}
                type="button"
                className="w-5 h-5 rounded border border-slate-600 cursor-pointer"
                style={{ backgroundColor: c }}
                onClick={() => { onChange(c); setIsOpen(false); }}
              />
            ))}
          </div>
          <div className="mt-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200"
            />
          </div>
          <button
            type="button"
            className="mt-2 w-full py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            onClick={() => setIsOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

const ResetButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-1 text-slate-400 hover:text-slate-200 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title="Reset to inherited value"
  >
    ↺
  </button>
);

export const StyleInput: React.FC<StyleInputProps> = ({
  label,
  value,
  type,
  units,
  options,
  onChange,
  placeholder,
  min,
  max,
  step,
  disabled,
  description,
}) => {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('base');
  
  const getValueForBreakpoint = useCallback((): string => {
    if (typeof value === 'object' && value !== null) {
      const rv = value as ResponsiveValue<unknown>;
      if (activeBreakpoint === 'desktop' && rv.desktop !== undefined) return String(rv.desktop);
      if (activeBreakpoint === 'tablet' && rv.tablet !== undefined) return String(rv.tablet);
      if (rv.base !== undefined) return String(rv.base);
      return '';
    }
    return value !== undefined ? String(value) : '';
  }, [value, activeBreakpoint]);

  const getInheritedValue = useCallback((): string => {
    if (typeof value === 'object' && value !== null) {
      const rv = value as ResponsiveValue<unknown>;
      if (activeBreakpoint === 'desktop') {
        if (rv.desktop !== undefined) return String(rv.desktop);
        if (rv.tablet !== undefined) return String(rv.tablet);
        return rv.base !== undefined ? String(rv.base) : '';
      }
      if (activeBreakpoint === 'tablet') {
        if (rv.tablet !== undefined) return String(rv.tablet);
        return rv.base !== undefined ? String(rv.base) : '';
      }
      return rv.base !== undefined ? String(rv.base) : '';
    }
    return '';
  }, [value, activeBreakpoint]);

  const hasBreakpointValue = useCallback((): boolean => {
    if (typeof value === 'object' && value !== null) {
      const rv = value as ResponsiveValue<unknown>;
      if (activeBreakpoint === 'desktop') return rv.desktop !== undefined;
      if (activeBreakpoint === 'tablet') return rv.tablet !== undefined;
      return rv.base !== undefined;
    }
    return value !== undefined;
  }, [value, activeBreakpoint]);

  const handleChange = useCallback((newValue: string) => {
    if (typeof value === 'object' && value !== null) {
      const newResponsive = { ...value } as ResponsiveValue<unknown>;
      if (activeBreakpoint === 'desktop') (newResponsive as Record<string, unknown>).desktop = newValue;
      else if (activeBreakpoint === 'tablet') (newResponsive as Record<string, unknown>).tablet = newValue;
      else (newResponsive as Record<string, unknown>).base = newValue;
      onChange(newResponsive as ResponsiveValue<string | number>);
    } else {
      onChange(newValue);
    }
  }, [value, activeBreakpoint, onChange]);

  const handleReset = useCallback(() => {
    if (typeof value === 'object' && value !== null) {
      const newResponsive = { ...value } as Record<string, unknown>;
      if (activeBreakpoint === 'desktop') delete newResponsive.desktop;
      else if (activeBreakpoint === 'tablet') delete newResponsive.tablet;
      else delete newResponsive.base;
      onChange(newResponsive as ResponsiveValue<string | number>);
    } else {
      onChange('');
    }
  }, [value, activeBreakpoint, onChange]);

  const currentValue = getValueForBreakpoint();
  const inheritedValue = getInheritedValue();
  const showInherited = activeBreakpoint !== 'base' && inheritedValue && currentValue !== inheritedValue;

  const inputContent = useMemo(() => {
    if (type === 'color') {
      return <ColorPicker value={currentValue} onChange={handleChange} />;
    }

    if (type === 'select' && options) {
      return (
        <select
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === 'range') {
      return (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={parseFloat(currentValue) || 0}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 w-10 text-right">{currentValue}</span>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center gap-1">
        <input
          type={type}
          value={currentValue}
          onChange={(e) => handleChange(type === 'number' ? e.target.value : e.target.value)}
          placeholder={showInherited ? inheritedValue : placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none placeholder:text-slate-500"
        />
        {units && units.length > 0 && (
          <UnitSelector units={units} value={currentValue} onChange={handleChange} />
        )}
      </div>
    );
  }, [type, options, currentValue, handleChange, disabled, min, max, step, placeholder, showInherited, inheritedValue, units]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label 
          className="text-xs font-medium text-slate-300"
          title={description}
        >
          {label}
        </label>
        <BreakpointTabs 
          active={activeBreakpoint} 
          onSelect={setActiveBreakpoint}
          values={typeof value === 'object' ? value as ResponsiveValue<unknown> : undefined}
        />
      </div>
      <div className="flex items-center gap-2">
        {inputContent}
        <ResetButton 
          onClick={handleReset} 
          disabled={disabled || !hasBreakpointValue()} 
        />
      </div>
      {showInherited && (
        <span className="text-xs text-slate-500 italic">
          Inherited: {inheritedValue}
        </span>
      )}
    </div>
  );
};

interface StyleInputGroupProps {
  label: string;
  children: React.ReactNode;
}

export const StyleInputGroup: React.FC<StyleInputGroupProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-400">{label}</label>
    {children}
  </div>
);