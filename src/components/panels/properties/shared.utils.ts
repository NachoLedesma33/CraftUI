import type { ResponsiveValue, Styles, UIComponent } from '@/types/canvas';

export const INPUT_CLASSES = "w-full px-3 py-2 text-sm bg-slate-700/60 border border-slate-600/60 rounded-lg text-slate-200 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm";
export const LABEL_CLASSES = "text-xs font-medium text-slate-400 mb-2 block tracking-tight";
export const SECTION_CLASSES = "mb-4";

export const debounce = <T extends (...args: Parameters<T>) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const getResponsiveValue = <T,>(rv: ResponsiveValue<T> | undefined, device: string): T | string => {
  if (!rv) return '';
  if (device === 'desktop' && rv.desktop !== undefined) return rv.desktop;
  if (device === 'tablet' && rv.tablet !== undefined) return rv.tablet;
  return rv.base;
};

export const setResponsiveValue = <T,>(rv: ResponsiveValue<T> | undefined, device: string, value: T): ResponsiveValue<T> => {
  const newRv = rv ? { ...rv } : { base: value as T };
  if (device === 'desktop') newRv.desktop = value as T;
  else if (device === 'tablet') newRv.tablet = value as T;
  else newRv.base = value as T;
  return newRv;
};

export const handleStyleChange = (
  key: keyof Styles,
  value: string,
  styles: Styles,
  device: string,
  debouncedUpdate: (updates: Partial<UIComponent>) => void,
) => {
  const currentValue = styles[key];
  const newValue = setResponsiveValue(currentValue as ResponsiveValue<unknown> | undefined, device, value);
  debouncedUpdate({ styles: { ...styles, [key]: newValue } });
};

export const getValue = (key: keyof Styles, styles: Styles, device: string): string => {
  const val = styles[key];
  if (!val) return '';
  return getResponsiveValue(val as ResponsiveValue<unknown>, device) as string;
};
