import React, { useState } from 'react';

interface SpacingDiagramProps {
  padding: string;
  margin: string;
  onPaddingChange: (value: string) => void;
  onMarginChange: (value: string) => void;
}

export const SpacingDiagram: React.FC<SpacingDiagramProps> = ({ padding, margin, onPaddingChange, onMarginChange }) => {
  const [active, setActive] = useState<'padding' | 'margin' | null>(null);
  const mVal = Math.min(parseFloat(margin) || 0, 48);
  const pVal = Math.min(parseFloat(padding) || 0, 48);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center p-2 select-none">
        <div className="relative" style={{ width: 120, height: 100 }}>
          {/* Margin layer */}
          <div
            className={`absolute inset-0 cursor-pointer transition-all duration-150 ${
              active === 'margin' ? 'bg-amber-500/30' : 'bg-amber-500/15 hover:bg-amber-500/20'
            }`}
            onClick={() => setActive(active === 'margin' ? null : 'margin')}
            style={{ margin: -mVal, padding: pVal }}
          >
            {/* Padding layer */}
            <div
              className={`w-full h-full cursor-pointer transition-all duration-150 ${
                active === 'padding' ? 'bg-emerald-500/30' : 'bg-emerald-500/15 hover:bg-emerald-500/20'
              }`}
              onClick={(e) => { e.stopPropagation(); setActive(active === 'padding' ? null : 'padding'); }}
              style={{ padding }}
            >
              {/* Content area */}
              <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                <span className="text-[8px] text-[var(--text-muted)]">content</span>
              </div>
            </div>
          </div>
          {/* Labels */}
          {active === 'margin' && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-amber-300 font-medium whitespace-nowrap bg-[var(--bg-secondary)] px-1">
              margin: {margin || '0'}
            </span>
          )}
          {active === 'padding' && (
            <span className="absolute top-1/2 -translate-y-1/2 -right-2 translate-x-full text-[9px] text-emerald-300 font-medium whitespace-nowrap bg-[var(--bg-secondary)] px-1">
              padding: {padding || '0'}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-[10px] text-amber-300 mb-0.5 font-medium">Margin</label>
          <input type="text" value={margin} onChange={(e) => onMarginChange(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] text-[11px] text-[var(--text-primary)] px-2 py-1 border-2 border-black focus:outline-none"
            placeholder="0" onFocus={() => setActive('margin')} onBlur={() => setActive(null)} />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] text-emerald-300 mb-0.5 font-medium">Padding</label>
          <input type="text" value={padding} onChange={(e) => onPaddingChange(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] text-[11px] text-[var(--text-primary)] px-2 py-1 border-2 border-black focus:outline-none"
            placeholder="0" onFocus={() => setActive('padding')} onBlur={() => setActive(null)} />
        </div>
      </div>
    </div>
  );
};
