import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/store';
import type { UIComponent, Styles } from '@/types/canvas';

interface LayoutEditorProps {
  component: UIComponent;
}

const FlexPlayground: React.FC<{
  values: Partial<Styles>;
  onChange: (values: Partial<Styles>) => void;
}> = ({ values, onChange }) => {
  const direction = (values.flexDirection?.base as string) || 'row';
  const justify = (values.justifyContent?.base as string) || 'flex-start';
  const align = (values.alignItems?.base as string) || 'stretch';
  const gap = (values.gap?.base as string) || '8px';
  const wrap = (values.flexWrap?.base as string) || 'nowrap';

  const justifyOptions = [
    { value: 'flex-start', label: '↖', title: 'Start' },
    { value: 'center', label: '⬌', title: 'Center' },
    { value: 'flex-end', label: '↗', title: 'End' },
    { value: 'space-between', label: '⬌⬌', title: 'Space Between' },
    { value: 'space-around', label: '◐◑', title: 'Space Around' },
    { value: 'space-evenly', label: '◉◉', title: 'Space Evenly' },
  ];

  const alignOptions = [
    { value: 'stretch', label: '▬', title: 'Stretch' },
    { value: 'flex-start', label: '↑', title: 'Start' },
    { value: 'center', label: '━', title: 'Center' },
    { value: 'flex-end', label: '↓', title: 'End' },
    { value: 'baseline', label: '≡', title: 'Baseline' },
  ];

  const directionOptions = [
    { value: 'row', label: '→', title: 'Row' },
    { value: 'column', label: '↓', title: 'Column' },
    { value: 'row-reverse', label: '←', title: 'Row Reverse' },
    { value: 'column-reverse', label: '↑', title: 'Column Reverse' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Direction</div>
      <div className="flex gap-1 mb-3">
        {directionOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ flexDirection: { base: opt.value as 'row' | 'column' | 'row-reverse' | 'column-reverse' } })}
            className={`flex-1 py-1.5 text-sm ${
              direction === opt.value
                ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
            title={opt.title}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Justify Content</div>
      <div className="flex gap-1 mb-3">
        {justifyOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ justifyContent: { base: opt.value as 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' } })}
            className={`flex-1 py-1.5 text-sm ${
              justify === opt.value
                ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
            title={opt.title}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Align Items</div>
      <div className="flex gap-1 mb-3">
        {alignOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ alignItems: { base: opt.value as 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' } })}
            className={`flex-1 py-1.5 text-sm ${
              align === opt.value
                ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
            title={opt.title}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-[var(--text-muted)]">Gap:</label>
        <input
          type="range"
          min="0"
          max="32"
          value={parseInt(gap) || 0}
          onChange={(e) => onChange({ gap: { base: `${e.target.value}px` } })}
          className="flex-1"
        />
        <span className="text-xs text-[var(--text-secondary)] w-12">{gap}</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-muted)]">Wrap:</label>
        <button
          type="button"
          onClick={() => onChange({ flexWrap: { base: wrap === 'nowrap' ? 'wrap' : 'nowrap' } })}
          className={`px-3 py-1 text-xs ${wrap === 'wrap' ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
        >
          {wrap}
        </button>
      </div>

      <div className="mt-4 p-2 bg-[var(--bg-primary)] text-xs font-mono text-[var(--text-secondary)]">
        {`display: flex;`}<br/>
        {`flex-direction: ${direction};`}<br/>
        {`justify-content: ${justify};`}<br/>
        {`align-items: ${align};`}<br/>
        {`gap: ${gap};`}
      </div>

      <div className="h-32 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border)] p-2" style={{ display: 'flex' }}>
        <div
          className="h-full w-full"
          style={{
            display: 'flex',
            flexDirection: direction as 'row' | 'column' | 'row-reverse' | 'column-reverse',
            justifyContent: justify as 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly',
            alignItems: align as 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline',
            gap: gap,
            flexWrap: wrap as 'nowrap' | 'wrap' | 'wrap-reverse',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`px-3 py-2 text-xs text-white font-medium ${
                i === 1 ? 'bg-red-500' : i === 2 ? 'bg-green-500' : 'bg-violet-500'
              }`}
            >
              Item {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GridMatrixEditor: React.FC<{
  values: Partial<Styles>;
  onChange: (values: Partial<Styles>) => void;
}> = ({ values, onChange }) => {
  const columns = (values.gridTemplateColumns?.base as string) || '1fr 1fr';
  const rows = (values.gridTemplateRows?.base as string) || 'auto';
  const gap = (values.gap?.base as string) || '8px';

  const [cols, setCols] = useState(() => {
    const match = columns.match(/(\d+)/g);
    return match ? match.length : 2;
  });

  const [rowsCount, setRowsCount] = useState(() => {
    const match = rows.match(/(\d+)/g);
    return match ? match.length : 1;
  });

  const presets = [
    { name: '2 Column', cols: 2, rows: 1, colsTemplate: '1fr 1fr' },
    { name: '3 Column', cols: 3, rows: 1, colsTemplate: '1fr 1fr 1fr' },
    { name: 'Sidebar', cols: 2, rows: 1, colsTemplate: '200px 1fr' },
    { name: 'Holy Grail', cols: 3, rows: 2, colsTemplate: '150px 1fr 150px', rowsTemplate: 'auto 1fr' },
    { name: 'Grid 2x2', cols: 2, rows: 2, colsTemplate: '1fr 1fr', rowsTemplate: '1fr 1fr' },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setCols(preset.cols);
    setRowsCount(preset.rows);
    onChange({
      gridTemplateColumns: { base: preset.colsTemplate },
      gridTemplateRows: { base: preset.rowsTemplate || 'auto' },
    });
  };

  const updateCols = (newCols: number) => {
    setCols(newCols);
    const template = Array(newCols).fill('1fr').join(' ');
    onChange({ gridTemplateColumns: { base: template } });
  };

  const updateRows = (newRows: number) => {
    setRowsCount(newRows);
    const template = Array(newRows).fill('1fr').join(' ');
    onChange({ gridTemplateRows: { base: template } });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Presets</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-2 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs text-[var(--text-muted)]">Columns: {cols}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={cols}
            onChange={(e) => updateCols(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-[var(--text-muted)]">Rows: {rowsCount}</label>
          <input
            type="range"
            min="1"
            max="4"
            value={rowsCount}
            onChange={(e) => updateRows(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-muted)]">Gap:</label>
        <input
          type="range"
          min="0"
          max="32"
          value={parseInt(gap) || 0}
          onChange={(e) => onChange({ gap: { base: `${e.target.value}px` } })}
          className="flex-1"
        />
        <span className="text-xs text-[var(--text-secondary)] w-12">{gap}</span>
      </div>

      <div className="mt-4 p-2 bg-[var(--bg-primary)] text-xs font-mono text-[var(--text-secondary)]">
        {`display: grid;`}<br/>
        {`grid-template-columns: ${columns};`}<br/>
        {`grid-template-rows: ${rows};`}<br/>
        {`gap: ${gap};`}
      </div>

      <div
        className="h-32 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border)] p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: columns,
          gridTemplateRows: rows,
          gap: gap,
        }}
      >
        {Array(cols * rowsCount).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-tertiary)] flex items-center justify-center text-xs text-[var(--text-muted)]"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LayoutVisualEditor: React.FC<LayoutEditorProps> = ({ component }) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  
  const [tempStyles, setTempStyles] = useState<Partial<Styles>>(component.styles);
  const [liveUpdate, setLiveUpdate] = useState(false);

  const display = (tempStyles.display?.base as string) || 'block';

  const handleChange = useCallback((updates: Partial<Styles>) => {
    const newStyles = { ...tempStyles, ...updates };
    setTempStyles(newStyles);
    
    if (liveUpdate) {
      updateComponent(component.id, { styles: newStyles });
    }
  }, [tempStyles, liveUpdate, component.id, updateComponent]);

  const handleApply = useCallback(() => {
    updateComponent(component.id, { styles: tempStyles });
  }, [component.id, tempStyles, updateComponent]);

  const handleReset = useCallback(() => {
    setTempStyles(component.styles);
  }, [component.styles]);

  const isFlex = display === 'flex';
  const isGrid = display === 'grid';

  if (!isFlex && !isGrid) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          This element doesn't have a Flex or Grid layout.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => handleChange({ display: { base: 'flex' } })}
            className="px-3 py-2 text-sm bg-[var(--accent)] text-[var(--text-primary)]"
          >
            Convert to Flex
          </button>
          <button
            type="button"
            onClick={() => handleChange({ display: { base: 'grid' } })}
            className="px-3 py-2 text-sm bg-green-500 text-white"
          >
            Convert to Grid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 bg-[var(--bg-secondary)]">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Visual Layout Editor</h3>
        <span className={`px-2 py-0.5 text-xs font-mono ${isFlex ? 'bg-[var(--accent)] text-[var(--text-primary)]' : 'bg-green-900 text-green-300'}`}>
          {display.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-muted)]">Live Update:</label>
        <button
          type="button"
          onClick={() => setLiveUpdate(!liveUpdate)}
          className={`w-10 h-5 transition-colors ${liveUpdate ? 'bg-[var(--accent)]' : 'bg-slate-600'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${liveUpdate ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {isFlex && <FlexPlayground values={tempStyles} onChange={handleChange} />}
      {isGrid && <GridMatrixEditor values={tempStyles} onChange={handleChange} />}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 py-2 text-sm bg-[var(--accent)] text-[var(--text-primary)] font-medium"
        >
          Apply Changes
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
};