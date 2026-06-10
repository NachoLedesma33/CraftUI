import React, { useMemo, useCallback } from 'react';
import type { Styles, UIComponent } from '@/types/canvas';
import { debounce } from './shared.utils';
import { StyleInput, StyleSection } from './shared';

export const LayoutTab: React.FC<{ component: UIComponent; updateComponent: (id: string, updates: Partial<UIComponent>) => void }> = ({ component, updateComponent }) => {
  const debouncedUpdate = useMemo(() => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 100, { leading: true }), [component.id, updateComponent]);

  const handleStyleChange = useCallback((key: keyof Styles, value: string) => debouncedUpdate({ styles: { ...component.styles, [key]: { base: value } } }), [component.styles, debouncedUpdate]);

  const getValue = useCallback((key: keyof Styles): string => {
    const val = component.styles[key];
    if (!val) return '';
    if (typeof val === 'object' && 'base' in val) return val.base as string;
    return '';
  }, [component.styles]);

  return (
    <div className="p-2 space-y-3">
      <StyleSection title="Display">
        <StyleInput label="Display" value={getValue('display')} onChange={(v) => handleStyleChange('display', v)}
          type="select" options={['block', 'flex', 'grid', 'inline', 'inline-block', 'none']} />
      </StyleSection>

      {getValue('display') === 'flex' && (
        <StyleSection title="Flex Properties">
          <StyleInput label="Flex Direction" value={getValue('flexDirection')} onChange={(v) => handleStyleChange('flexDirection', v)}
            type="select" options={['row', 'column', 'row-reverse', 'column-reverse']} />
          <StyleInput label="Justify Content" value={getValue('justifyContent')} onChange={(v) => handleStyleChange('justifyContent', v)}
            type="select" options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']} />
          <StyleInput label="Align Items" value={getValue('alignItems')} onChange={(v) => handleStyleChange('alignItems', v)}
            type="select" options={['stretch', 'flex-start', 'flex-end', 'center', 'baseline']} />
          <StyleInput label="Flex Wrap" value={getValue('flexWrap')} onChange={(v) => handleStyleChange('flexWrap', v)}
            type="select" options={['nowrap', 'wrap', 'wrap-reverse']} />
        </StyleSection>
      )}

      {getValue('display') === 'grid' && (
        <StyleSection title="Grid Properties">
          <StyleInput label="Grid Template Columns" value={getValue('gridTemplateColumns')} onChange={(v) => handleStyleChange('gridTemplateColumns', v)} placeholder="1fr 1fr" />
          <StyleInput label="Grid Template Rows" value={getValue('gridTemplateRows')} onChange={(v) => handleStyleChange('gridTemplateRows', v)} placeholder="auto" />
        </StyleSection>
      )}

      <StyleSection title="Overflow">
        <StyleInput label="Overflow" value={getValue('overflow')} onChange={(v) => handleStyleChange('overflow', v)}
          type="select" options={['visible', 'hidden', 'scroll', 'auto']} />
      </StyleSection>

      <StyleSection title="Opacity">
        <StyleInput label="Opacity (0-1)" value={getValue('opacity')?.toString() || ''} onChange={(v) => handleStyleChange('opacity', v)} type="number" placeholder="1" />
      </StyleSection>
    </div>
  );
};
