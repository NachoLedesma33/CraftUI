import React, { useState } from 'react';
import { SECTION_CLASSES, INPUT_CLASSES, LABEL_CLASSES } from './shared.utils';

interface StyleInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
}

export const StyleInput: React.FC<StyleInputProps> = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <div className={SECTION_CLASSES}>
    <label className={LABEL_CLASSES}>{label}</label>
    {type === 'select' && options ? (
      <select className={INPUT_CLASSES} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input type={type} className={INPUT_CLASSES} value={value}
        onChange={(e) => onChange(type === 'number' ? Math.max(0, parseFloat(e.target.value) || 0).toString() : e.target.value)}
        placeholder={placeholder} />
    )}
  </div>
);

export const StyleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700 pb-2 mb-2">
      <button type="button" className="flex items-center justify-between w-full text-xs font-medium text-slate-300 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};
