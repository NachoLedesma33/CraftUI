import React, { useMemo, useCallback } from 'react';
import type { Styles, UIComponent } from '@/types/canvas';
import { useUIStore } from '@/store';
import { debounce, getValue, handleStyleChange } from './shared.utils';
import { StyleInput, StyleSection } from './shared';
import { SpacingDiagram } from './SpacingDiagram';

const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#8b5cf6', '#ec4899'];

export const StylesTab: React.FC<{ component: UIComponent; updateComponent: (id: string, updates: Partial<UIComponent>) => void }> = ({ component, updateComponent }) => {
  const activeBreakpoint = useUIStore((s) => s.activeBreakpoint);
  const styles = component.styles;

  const debouncedUpdate = useMemo(() => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 100, { leading: true }), [component.id, updateComponent]);

  const onStyleChange = useCallback((key: keyof Styles, value: string) => handleStyleChange(key, value, styles, activeBreakpoint, debouncedUpdate), [styles, activeBreakpoint, debouncedUpdate]);
  const val = useCallback((key: keyof Styles): string => getValue(key, styles, activeBreakpoint), [styles, activeBreakpoint]);

  return (
    <div className="p-2 space-y-2 overflow-auto">

      <StyleSection title="Colors">
        <div className="flex gap-1 flex-wrap mb-2 w-full">
          {colors.map((c) => (
            <button key={c} type="button" className={`flex-1 min-w-6 h-6 border-12 cursor-pointer ${val('backgroundColor') === c ? 'border-[var(--border)]' : 'border-[var(--border)]'}`}
              style={{ backgroundColor: c, borderColor: c }} onClick={() => onStyleChange('backgroundColor', c)} />
          ))}
        </div>
        <StyleInput label="Background" value={val('backgroundColor')} onChange={(v) => onStyleChange('backgroundColor', v)} placeholder="#000000" />
        <StyleInput label="Text Color" value={val('color')} onChange={(v) => onStyleChange('color', v)} placeholder="#000000" />
      </StyleSection>

      <StyleSection title="Typography">
        <StyleInput label="Font Size" value={val('fontSize')} onChange={(v) => onStyleChange('fontSize', v)} placeholder="16px" />
        <StyleInput label="Font Weight" value={val('fontWeight')} onChange={(v) => onStyleChange('fontWeight', v)} type="select" options={['400', '500', '600', '700', '800', '900']} />
        <StyleInput label="Text Align" value={val('textAlign')} onChange={(v) => onStyleChange('textAlign', v)} type="select" options={['left', 'center', 'right', 'justify']} />
      </StyleSection>

      <StyleSection title="Spacing">
        <SpacingDiagram
          padding={val('padding')}
          margin={val('margin')}
          onPaddingChange={(v) => onStyleChange('padding', v)}
          onMarginChange={(v) => onStyleChange('margin', v)}
        />
        <StyleInput label="Gap" value={val('gap')} onChange={(v) => onStyleChange('gap', v)} placeholder="8px" />
      </StyleSection>

      <StyleSection title="Borders">
        <StyleInput label="Border Radius" value={val('borderRadius')} onChange={(v) => onStyleChange('borderRadius', v)} placeholder="4px" />
        <StyleInput label="Border Width" value={val('borderWidth')} onChange={(v) => onStyleChange('borderWidth', v)} placeholder="1px" />
        <StyleInput label="Border Color" value={val('borderColor')} onChange={(v) => onStyleChange('borderColor', v)} placeholder="#000000" />
      </StyleSection>

      <StyleSection title="Size">
        <StyleInput label="Width" value={val('width')} onChange={(v) => onStyleChange('width', v)} placeholder="100%" />
        <StyleInput label="Height" value={val('height')} onChange={(v) => onStyleChange('height', v)} placeholder="auto" />
        <StyleInput label="Max Width" value={val('maxWidth')} onChange={(v) => onStyleChange('maxWidth', v)} placeholder="none" />
      </StyleSection>

      <StyleSection title="Position">
        <StyleInput label="Position" value={val('position')} onChange={(v) => onStyleChange('position', v)} type="select" options={['static', 'relative', 'absolute', 'fixed', 'sticky']} />
        <StyleInput label="Top" value={val('top')} onChange={(v) => onStyleChange('top', v)} placeholder="auto" />
        <StyleInput label="Left" value={val('left')} onChange={(v) => onStyleChange('left', v)} placeholder="auto" />
        <StyleInput label="Z-Index" value={val('zIndex')?.toString() || ''} onChange={(v) => onStyleChange('zIndex', v)} type="number" placeholder="0" />
      </StyleSection>
    </div>
  );
};
