import React, { useMemo, useCallback } from 'react';
import type { Styles, UIComponent } from '@/types/canvas';
import { useUIStore } from '@/store';
import { debounce, getValue as rGetValue, handleStyleChange } from './shared.utils';
import { StyleInput, StyleSection } from './shared';

export const LayoutTab: React.FC<{ component: UIComponent; updateComponent: (id: string, updates: Partial<UIComponent>) => void }> = ({ component, updateComponent }) => {
  const activeBreakpoint = useUIStore((s) => s.activeBreakpoint);
  const debouncedUpdate = useMemo(() => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 100, { leading: true }), [component.id, updateComponent]);

  const onStyleChange = useCallback((key: keyof Styles, value: string) => handleStyleChange(key, value, component.styles, activeBreakpoint, debouncedUpdate), [component.styles, activeBreakpoint, debouncedUpdate]);
  const val = useCallback((key: keyof Styles): string => rGetValue(key, component.styles, activeBreakpoint), [component.styles, activeBreakpoint]);

  return (
    <div className="p-2 space-y-3">
      <StyleSection title="Display">
        <StyleInput label="Display" value={val('display')} onChange={(v) => onStyleChange('display', v)}
          type="select" options={['block', 'flex', 'grid', 'inline', 'inline-block', 'none']} />
      </StyleSection>

      {val('display') === 'flex' && (
        <StyleSection title="Flex Properties">
          <StyleInput label="Flex Direction" value={val('flexDirection')} onChange={(v) => onStyleChange('flexDirection', v)}
            type="select" options={['row', 'column', 'row-reverse', 'column-reverse']} />
          <StyleInput label="Justify Content" value={val('justifyContent')} onChange={(v) => onStyleChange('justifyContent', v)}
            type="select" options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']} />
          <StyleInput label="Align Items" value={val('alignItems')} onChange={(v) => onStyleChange('alignItems', v)}
            type="select" options={['stretch', 'flex-start', 'flex-end', 'center', 'baseline']} />
          <StyleInput label="Flex Wrap" value={val('flexWrap')} onChange={(v) => onStyleChange('flexWrap', v)}
            type="select" options={['nowrap', 'wrap', 'wrap-reverse']} />
        </StyleSection>
      )}

      {val('display') === 'grid' && (
        <StyleSection title="Grid Properties">
          <StyleInput label="Grid Template Columns" value={val('gridTemplateColumns')} onChange={(v) => onStyleChange('gridTemplateColumns', v)} placeholder="1fr 1fr" />
          <StyleInput label="Grid Template Rows" value={val('gridTemplateRows')} onChange={(v) => onStyleChange('gridTemplateRows', v)} placeholder="auto" />
        </StyleSection>
      )}

      <StyleSection title="Overflow">
        <StyleInput label="Overflow" value={val('overflow')} onChange={(v) => onStyleChange('overflow', v)}
          type="select" options={['visible', 'hidden', 'scroll', 'auto']} />
      </StyleSection>

      <StyleSection title="Opacity">
        <StyleInput label="Opacity (0-1)" value={val('opacity')?.toString() || ''} onChange={(v) => onStyleChange('opacity', v)} type="number" placeholder="1" />
      </StyleSection>
    </div>
  );
};
