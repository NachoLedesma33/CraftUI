import React, { useMemo, useCallback } from 'react';
import type { UIComponent } from '@/types/canvas';
import { INPUT_CLASSES, LABEL_CLASSES, SECTION_CLASSES, debounce } from './shared.utils';

export const ContentTab: React.FC<{ component: UIComponent; updateComponent: (id: string, updates: Partial<UIComponent>) => void }> = ({ component, updateComponent }) => {
  const debouncedUpdate = useMemo(() => debounce((updates: Partial<UIComponent>) => updateComponent(component.id, updates), 100, { leading: true }), [component.id, updateComponent]);

  const handleChange = useCallback((key: string, value: string | boolean) => debouncedUpdate({ props: { ...component.props, [key]: value } }), [component.props, debouncedUpdate]);

  return (
    <div className="p-2 space-y-3">
      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Component Name</label>
        <input type="text" className={INPUT_CLASSES} value={component.metadata.name}
          onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, name: e.target.value } })} />
      </div>

      {component.type === 'text' && (
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Text Content</label>
          <textarea className={`${INPUT_CLASSES} min-h-[80px] resize-y`} value={component.props.text || ''}
            onChange={(e) => handleChange('text', e.target.value)} placeholder="Enter text..." />
        </div>
      )}

      {component.type === 'button' && (
        <>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Button Text</label>
            <input type="text" className={INPUT_CLASSES} value={component.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)} placeholder="Button" />
          </div>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Type</label>
            <select className={INPUT_CLASSES} value={component.props.type || 'button'} onChange={(e) => handleChange('type', e.target.value)}>
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
            <input type="text" className={INPUT_CLASSES} value={component.props.src || ''}
              onChange={(e) => handleChange('src', e.target.value)} placeholder="https://..." />
          </div>
          <div className={SECTION_CLASSES}>
            <label className={LABEL_CLASSES}>Alt Text</label>
            <input type="text" className={INPUT_CLASSES} value={component.props.alt || ''}
              onChange={(e) => handleChange('alt', e.target.value)} placeholder="Image description" />
          </div>
        </>
      )}

      {component.type === 'button' && (
        <div className={SECTION_CLASSES}>
          <label className={LABEL_CLASSES}>Href (Link)</label>
          <input type="text" className={INPUT_CLASSES} value={component.props.href || ''}
            onChange={(e) => handleChange('href', e.target.value)} placeholder="https://..." />
        </div>
      )}

      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Disabled</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={component.props.disabled || false}
            onChange={(e) => updateComponent(component.id, { props: { ...component.props, disabled: e.target.checked } })} />
          <span className="text-xs text-[var(--text-muted)]">Disabled</span>
        </label>
      </div>
    </div>
  );
};
