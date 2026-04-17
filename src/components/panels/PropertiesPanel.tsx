import React, { useState, useCallback, useMemo } from 'react';
import { useEditorStore, useSelectedId } from '@/store';
import type { Styles, ResponsiveValue, UIComponent, ComponentType } from '@/types/canvas';
import { AnimationPanel } from './AnimationPanel';

const INPUT_CLASSES = "w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none";
const LABEL_CLASSES = "text-xs text-slate-400 mb-1 block";
const SECTION_CLASSES = "mb-3";

const debounce = <T extends (...args: Parameters<T>) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

interface StyleInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
}

const StyleInput: React.FC<StyleInputProps> = ({ label, value, onChange, type = 'text', options, placeholder }) => {
  return (
    <div className={SECTION_CLASSES}>
      <label className={LABEL_CLASSES}>{label}</label>
      {type === 'select' && options ? (
        <select className={INPUT_CLASSES} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={INPUT_CLASSES}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Math.max(0, parseFloat(e.target.value) || 0).toString() : e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

const getResponsiveValue = <T,>(rv: ResponsiveValue<T> | undefined, device: string): T | string => {
  if (!rv) return '';
  if (device === 'desktop' && rv.desktop !== undefined) return rv.desktop;
  if (device === 'tablet' && rv.tablet !== undefined) return rv.tablet;
  return rv.base;
};

const setResponsiveValue = <T,>(rv: ResponsiveValue<T> | undefined, device: string, value: T): ResponsiveValue<T> => {
  const newRv = rv ? { ...rv } : { base: value as T };
  if (device === 'desktop') newRv.desktop = value as T;
  else if (device === 'tablet') newRv.tablet = value as T;
  else newRv.base = value as T;
  return newRv;
};

const StyleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-slate-700 pb-2 mb-2">
      <button
        type="button"
        className="flex items-center justify-between w-full text-xs font-medium text-slate-300 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

const StylesTab: React.FC<{
  component: UIComponent;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
}> = ({ component, updateComponent }) => {
  const [device, setDevice] = useState<'base' | 'tablet' | 'desktop'>('base');
  const styles = component.styles;
  
const debouncedUpdate = useMemo(
    () => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 300),
    [component.id, updateComponent]
  );

  const handleStyleChange = useCallback((key: keyof Styles, value: string) => {
    const currentValue = styles[key];
    const newValue = setResponsiveValue(currentValue as ResponsiveValue<unknown> | undefined, device, value);
    debouncedUpdate({ styles: { ...styles, [key]: newValue } });
  }, [styles, device, debouncedUpdate]);

  const getValue = useCallback((key: keyof Styles): string => {
    const val = styles[key];
    if (!val) return '';
    return getResponsiveValue(val as ResponsiveValue<unknown>, device) as string;
  }, [styles, device]);

  const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  return (
    <div className="p-2 space-y-2 overflow-auto">
      <div className="flex gap-1 mb-3">
        {(['base', 'tablet', 'desktop'] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={`flex-1 py-1 text-xs rounded ${device === d ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setDevice(d)}
          >
            {d === 'base' ? '📱' : d === 'tablet' ? '📐' : '💻'}
          </button>
        ))}
      </div>
      
      <StyleSection title="Colors">
        <div className="flex gap-1 flex-wrap mb-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-6 h-6 rounded border-2 ${getValue('backgroundColor') === c ? 'border-blue-500' : 'border-slate-600'}`}
              style={{ backgroundColor: c }}
              onClick={() => handleStyleChange('backgroundColor', c)}
            />
          ))}
        </div>
        <StyleInput
          label="Background"
          value={getValue('backgroundColor')}
          onChange={(v) => handleStyleChange('backgroundColor', v)}
          placeholder="#000000"
        />
        <StyleInput
          label="Text Color"
          value={getValue('color')}
          onChange={(v) => handleStyleChange('color', v)}
          placeholder="#000000"
        />
      </StyleSection>

      <StyleSection title="Typography">
        <StyleInput
          label="Font Size"
          value={getValue('fontSize')}
          onChange={(v) => handleStyleChange('fontSize', v)}
          placeholder="16px"
        />
        <StyleInput
          label="Font Weight"
          value={getValue('fontWeight')}
          onChange={(v) => handleStyleChange('fontWeight', v)}
          type="select"
          options={['400', '500', '600', '700', '800', '900']}
        />
        <StyleInput
          label="Text Align"
          value={getValue('textAlign')}
          onChange={(v) => handleStyleChange('textAlign', v)}
          type="select"
          options={['left', 'center', 'right', 'justify']}
        />
      </StyleSection>

      <StyleSection title="Spacing">
        <StyleInput
          label="Padding"
          value={getValue('padding')}
          onChange={(v) => handleStyleChange('padding', v)}
          placeholder="8px"
        />
        <StyleInput
          label="Margin"
          value={getValue('margin')}
          onChange={(v) => handleStyleChange('margin', v)}
          placeholder="8px"
        />
        <StyleInput
          label="Gap"
          value={getValue('gap')}
          onChange={(v) => handleStyleChange('gap', v)}
          placeholder="8px"
        />
      </StyleSection>

      <StyleSection title="Borders">
        <StyleInput
          label="Border Radius"
          value={getValue('borderRadius')}
          onChange={(v) => handleStyleChange('borderRadius', v)}
          placeholder="4px"
        />
        <StyleInput
          label="Border Width"
          value={getValue('borderWidth')}
          onChange={(v) => handleStyleChange('borderWidth', v)}
          placeholder="1px"
        />
        <StyleInput
          label="Border Color"
          value={getValue('borderColor')}
          onChange={(v) => handleStyleChange('borderColor', v)}
          placeholder="#000000"
        />
      </StyleSection>

      <StyleSection title="Size">
        <StyleInput
          label="Width"
          value={getValue('width')}
          onChange={(v) => handleStyleChange('width', v)}
          placeholder="100%"
        />
        <StyleInput
          label="Height"
          value={getValue('height')}
          onChange={(v) => handleStyleChange('height', v)}
          placeholder="auto"
        />
        <StyleInput
          label="Max Width"
          value={getValue('maxWidth')}
          onChange={(v) => handleStyleChange('maxWidth', v)}
          placeholder="none"
        />
      </StyleSection>

      <StyleSection title="Position">
        <StyleInput
          label="Position"
          value={getValue('position')}
          onChange={(v) => handleStyleChange('position', v)}
          type="select"
          options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
        />
        <StyleInput
          label="Top"
          value={getValue('top')}
          onChange={(v) => handleStyleChange('top', v)}
          placeholder="auto"
        />
        <StyleInput
          label="Left"
          value={getValue('left')}
          onChange={(v) => handleStyleChange('left', v)}
          placeholder="auto"
        />
        <StyleInput
          label="Z-Index"
          value={getValue('zIndex')?.toString() || ''}
          onChange={(v) => handleStyleChange('zIndex', v)}
          type="number"
          placeholder="0"
        />
      </StyleSection>
    </div>
  );
};

const ContentTab: React.FC<{
  component: UIComponent;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
}> = ({ component, updateComponent }) => {
  const debouncedUpdate = useMemo(
    () => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 300),
    [component.id, updateComponent]
  );

  const handleChange = useCallback((key: string, value: string) => {
    debouncedUpdate({ props: { ...component.props, [key]: value } });
  }, [component.props, debouncedUpdate]);

  return (
    <div className="p-2 space-y-3">
      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Component Name</label>
        <input
          type="text"
          className={INPUT_CLASSES}
          value={component.metadata.name}
          onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, name: e.target.value } })}
        />
      </div>

      {component.type === 'text' && (
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Text Content</label>
          <textarea
            className={`${INPUT_CLASSES} min-h-[80px] resize-y`}
            value={component.props.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Enter text..."
          />
        </div>
      )}

      {component.type === 'button' && (
        <>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Button Text</label>
            <input
              type="text"
              className={INPUT_CLASSES}
              value={component.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Button"
            />
          </div>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Type</label>
            <select
              className={INPUT_CLASSES}
              value={component.props.type || 'button'}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="button">Button</option>
              <option value="submit">Submit</option>
              <option value="reset">Reset</option>
            </select>
          </div>
        </>
      )}

      {component.type === 'image' && (
        <>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Image URL</label>
            <input
              type="text"
              className={INPUT_CLASSES}
              value={component.props.src || ''}
              onChange={(e) => handleChange('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Alt Text</label>
            <input
              type="text"
              className={INPUT_CLASSES}
              value={component.props.alt || ''}
              onChange={(e) => handleChange('alt', e.target.value)}
              placeholder="Image description"
            />
          </div>
        </>
      )}

      {component.type === 'button' && (
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Href (Link)</label>
          <input
            type="text"
            className={INPUT_CLASSES}
            value={component.props.href || ''}
            onChange={(e) => handleChange('href', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Disabled</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={component.props.disabled || false}
            onChange={(e) => handleChange('disabled', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <span className="text-xs text-slate-400">Disabled</span>
        </label>
      </div>
    </div>
  );
};

const LayoutTab: React.FC<{
  component: UIComponent;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
}> = ({ component, updateComponent }) => {
  const debouncedUpdate = useMemo(
    () => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 300),
    [component.id, updateComponent]
  );

  const handleStyleChange = useCallback((key: keyof Styles, value: string) => {
    debouncedUpdate({ styles: { ...component.styles, [key]: { base: value } } });
  }, [component.styles, debouncedUpdate]);

  const getValue = useCallback((key: keyof Styles): string => {
    const val = component.styles[key];
    if (!val) return '';
    if (typeof val === 'object' && 'base' in val) return val.base as string;
    return '';
  }, [component.styles]);

  return (
    <div className="p-2 space-y-3">
      <StyleSection title="Display">
        <StyleInput
          label="Display"
          value={getValue('display')}
          onChange={(v) => handleStyleChange('display', v)}
          type="select"
          options={['block', 'flex', 'grid', 'inline', 'inline-block', 'none']}
        />
      </StyleSection>

      {getValue('display') === 'flex' && (
        <StyleSection title="Flex Properties">
          <StyleInput
            label="Flex Direction"
            value={getValue('flexDirection')}
            onChange={(v) => handleStyleChange('flexDirection', v)}
            type="select"
            options={['row', 'column', 'row-reverse', 'column-reverse']}
          />
          <StyleInput
            label="Justify Content"
            value={getValue('justifyContent')}
            onChange={(v) => handleStyleChange('justifyContent', v)}
            type="select"
            options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']}
          />
          <StyleInput
            label="Align Items"
            value={getValue('alignItems')}
            onChange={(v) => handleStyleChange('alignItems', v)}
            type="select"
            options={['stretch', 'flex-start', 'flex-end', 'center', 'baseline']}
          />
          <StyleInput
            label="Flex Wrap"
            value={getValue('flexWrap')}
            onChange={(v) => handleStyleChange('flexWrap', v)}
            type="select"
            options={['nowrap', 'wrap', 'wrap-reverse']}
          />
        </StyleSection>
      )}

      {getValue('display') === 'grid' && (
        <StyleSection title="Grid Properties">
          <StyleInput
            label="Grid Template Columns"
            value={getValue('gridTemplateColumns')}
            onChange={(v) => handleStyleChange('gridTemplateColumns', v)}
            placeholder="1fr 1fr"
          />
          <StyleInput
            label="Grid Template Rows"
            value={getValue('gridTemplateRows')}
            onChange={(v) => handleStyleChange('gridTemplateRows', v)}
            placeholder="auto"
          />
        </StyleSection>
      )}

      <StyleSection title="Overflow">
        <StyleInput
          label="Overflow"
          value={getValue('overflow')}
          onChange={(v) => handleStyleChange('overflow', v)}
          type="select"
          options={['visible', 'hidden', 'scroll', 'auto']}
        />
      </StyleSection>

      <StyleSection title="Opacity">
        <StyleInput
          label="Opacity (0-1)"
          value={getValue('opacity')?.toString() || ''}
          onChange={(v) => handleStyleChange('opacity', v)}
          type="number"
          placeholder="1"
        />
      </StyleSection>
    </div>
  );
};

const AdvancedTab: React.FC<{
  component: UIComponent;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
}> = ({ component, updateComponent }) => {
  return (
    <div className="p-2 space-y-3">
      <StyleSection title="Visibility">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={component.metadata.isVisible}
            onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, isVisible: e.target.checked } })}
            className="rounded"
          />
          <span className="text-xs text-slate-400">Visible</span>
        </label>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={component.metadata.isLocked}
            onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, isLocked: e.target.checked } })}
            className="rounded"
          />
          <span className="text-xs text-slate-400">Locked</span>
        </label>
      </StyleSection>

      <StyleSection title="ID & Classes">
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Component ID</label>
          <input
            type="text"
            className={INPUT_CLASSES}
            value={component.id}
            readOnly
          />
        </div>
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Type</label>
          <input
            type="text"
            className={INPUT_CLASSES}
            value={component.type}
            readOnly
          />
        </div>
      </StyleSection>
    </div>
  );
};

export const PropertiesPanel: React.FC = () => {
  const selectedId = useSelectedId();
  const components = useEditorStore((s) => s.components);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  
  const [activeTab, setActiveTab] = useState<'styles' | 'content' | 'layout' | 'advanced' | 'animations'>('styles');

  const component = selectedId ? components[selectedId] : null;

  if (!component) {
    return (
      <div className="w-72 border-l bg-slate-800 flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm text-center">Select an element to edit its properties</p>
      </div>
    );
  }

  const typeIcon = (type: ComponentType): string => {
    switch (type) {
      case 'box': return '□';
      case 'text': return 'T';
      case 'button': return '●';
      case 'image': return '◎';
      case 'container': return '▢';
      case 'flex': return '≡';
      case 'grid': return '⊞';
      default: return '○';
    }
  };

  return (
    <div className="w-72 border-l bg-slate-800 flex flex-col h-full">
      <div className="p-3 border-b border-slate-700 flex items-center gap-2">
        <span className="text-lg">{typeIcon(component.type)}</span>
        <span className="text-sm font-medium text-white">{component.metadata.name}</span>
        <span className="text-xs text-slate-500">({component.type})</span>
      </div>
      
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {(['styles', 'content', 'layout', 'advanced', 'animations'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`flex-1 py-2 text-xs capitalize transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'styles' && <StylesTab component={component} updateComponent={updateComponent} />}
        {activeTab === 'content' && <ContentTab component={component} updateComponent={updateComponent} />}
        {activeTab === 'layout' && <LayoutTab component={component} updateComponent={updateComponent} />}
        {activeTab === 'advanced' && <AdvancedTab component={component} updateComponent={updateComponent} />}
        {activeTab === 'animations' && <AnimationPanel />}
      </div>
    </div>
  );
};