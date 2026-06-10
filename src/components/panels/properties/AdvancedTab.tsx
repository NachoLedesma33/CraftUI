import React from 'react';
import type { UIComponent } from '@/types/canvas';
import { INPUT_CLASSES, LABEL_CLASSES, SECTION_CLASSES } from './shared.utils';
import { StyleSection } from './shared';

export const AdvancedTab: React.FC<{ component: UIComponent; updateComponent: (id: string, updates: Partial<UIComponent>) => void }> = ({ component, updateComponent }) => (
  <div className="p-2 space-y-3">
    <StyleSection title="Visibility">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={component.metadata.isVisible}
          onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, isVisible: e.target.checked } })} className="rounded" />
        <span className="text-xs text-slate-400">Visible</span>
      </label>
      <label className="flex items-center gap-2 mt-2">
        <input type="checkbox" checked={component.metadata.isLocked}
          onChange={(e) => updateComponent(component.id, { metadata: { ...component.metadata, isLocked: e.target.checked } })} className="rounded" />
        <span className="text-xs text-slate-400">Locked</span>
      </label>
    </StyleSection>

    <StyleSection title="ID & Classes">
      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Component ID</label>
        <input type="text" className={INPUT_CLASSES} value={component.id} readOnly />
      </div>
      <div className={SECTION_CLASSES}>
        <label className={LABEL_CLASSES}>Type</label>
        <input type="text" className={INPUT_CLASSES} value={component.type} readOnly />
      </div>
    </StyleSection>
  </div>
);
