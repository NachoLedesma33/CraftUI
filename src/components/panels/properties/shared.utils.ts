import type { ResponsiveValue, Styles, UIComponent } from '@/types/canvas';

export const INPUT_CLASSES = "w-full px-3 py-2 text-sm bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none";
export const LABEL_CLASSES = "text-xs font-medium text-[var(--text-secondary)] mb-2 block";
export const SECTION_CLASSES = "mb-4";

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number, options?: { leading?: boolean }) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (options?.leading && timeoutId === null) {
      fn(...args);
      lastArgs = null;
    }

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (lastArgs) fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }, delay);
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
