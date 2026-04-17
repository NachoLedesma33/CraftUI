import type { KeyframeStep } from '@/types/canvas';

export interface AnimationPreset {
  id: string;
  label: string;
  category: 'entrada' | 'énfasis' | 'transformación';
  duration: number;
  easing: string;
  keyframes: KeyframeStep[];
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  // === ENTRADA ===
  fadeIn: {
    id: 'fadeIn',
    label: 'Fade In',
    category: 'entrada',
    duration: 600,
    easing: 'ease-out',
    keyframes: [
      { percent: 0, properties: { opacity: '0' } },
      { percent: 100, properties: { opacity: '1' } },
    ],
  },
  slideInTop: {
    id: 'slideInTop',
    label: 'Slide In Top',
    category: 'entrada',
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: [
      { percent: 0, properties: { transform: 'translateY(-100px)', opacity: '0' } },
      { percent: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
  },
  slideInBottom: {
    id: 'slideInBottom',
    label: 'Slide In Bottom',
    category: 'entrada',
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: [
      { percent: 0, properties: { transform: 'translateY(100px)', opacity: '0' } },
      { percent: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
  },
  slideInLeft: {
    id: 'slideInLeft',
    label: 'Slide In Left',
    category: 'entrada',
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: [
      { percent: 0, properties: { transform: 'translateX(-100px)', opacity: '0' } },
      { percent: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
    ],
  },
  slideInRight: {
    id: 'slideInRight',
    label: 'Slide In Right',
    category: 'entrada',
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: [
      { percent: 0, properties: { transform: 'translateX(100px)', opacity: '0' } },
      { percent: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
    ],
  },
  scaleUp: {
    id: 'scaleUp',
    label: 'Scale Up',
    category: 'entrada',
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    keyframes: [
      { percent: 0, properties: { transform: 'scale(0.8)', opacity: '0' } },
      { percent: 100, properties: { transform: 'scale(1)', opacity: '1' } },
    ],
  },
  zoomIn: {
    id: 'zoomIn',
    label: 'Zoom In',
    category: 'entrada',
    duration: 500,
    easing: 'ease-out',
    keyframes: [
      { percent: 0, properties: { transform: 'scale(0.5)', opacity: '0' } },
      { percent: 100, properties: { transform: 'scale(1)', opacity: '1' } },
    ],
  },

  // === ÉNFASIS ===
  pulse: {
    id: 'pulse',
    label: 'Pulse',
    category: 'énfasis',
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: [
      { percent: 0, properties: { opacity: '1' } },
      { percent: 50, properties: { opacity: '0.7' } },
      { percent: 100, properties: { opacity: '1' } },
    ],
  },
  bounce: {
    id: 'bounce',
    label: 'Bounce',
    category: 'énfasis',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: [
      { percent: 0, properties: { transform: 'translateY(0)' } },
      { percent: 50, properties: { transform: 'translateY(-20px)' } },
      { percent: 100, properties: { transform: 'translateY(0)' } },
    ],
  },
  shake: {
    id: 'shake',
    label: 'Shake',
    category: 'énfasis',
    duration: 400,
    easing: 'linear',
    keyframes: [
      { percent: 0, properties: { transform: 'translateX(0)' } },
      { percent: 25, properties: { transform: 'translateX(-5px)' } },
      { percent: 50, properties: { transform: 'translateX(5px)' } },
      { percent: 75, properties: { transform: 'translateX(-5px)' } },
      { percent: 100, properties: { transform: 'translateX(0)' } },
    ],
  },
  swing: {
    id: 'swing',
    label: 'Swing',
    category: 'énfasis',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: [
      { percent: 20, properties: { transform: 'rotate(15deg)' } },
      { percent: 40, properties: { transform: 'rotate(-10deg)' } },
      { percent: 60, properties: { transform: 'rotate(5deg)' } },
      { percent: 80, properties: { transform: 'rotate(-5deg)' } },
      { percent: 100, properties: { transform: 'rotate(0deg)' } },
    ],
  },
  heartBeat: {
    id: 'heartBeat',
    label: 'Heart Beat',
    category: 'énfasis',
    duration: 1300,
    easing: 'ease-out',
    keyframes: [
      { percent: 0, properties: { transform: 'scale(1)' } },
      { percent: 14, properties: { transform: 'scale(1.3)' } },
      { percent: 28, properties: { transform: 'scale(1)' } },
      { percent: 42, properties: { transform: 'scale(1.3)' } },
      { percent: 70, properties: { transform: 'scale(1)' } },
      { percent: 100, properties: { transform: 'scale(1)' } },
    ],
  },
  flash: {
    id: 'flash',
    label: 'Flash',
    category: 'énfasis',
    duration: 400,
    easing: 'linear',
    keyframes: [
      { percent: 0, properties: { opacity: '1' } },
      { percent: 25, properties: { opacity: '0' } },
      { percent: 50, properties: { opacity: '1' } },
      { percent: 75, properties: { opacity: '0' } },
      { percent: 100, properties: { opacity: '1' } },
    ],
  },

  // === TRANSFORMACIÓN ===
  rotate: {
    id: 'rotate',
    label: 'Rotate',
    category: 'transformación',
    duration: 600,
    easing: 'linear',
    keyframes: [
      { percent: 0, properties: { transform: 'rotate(0deg)' } },
      { percent: 100, properties: { transform: 'rotate(360deg)' } },
    ],
  },
  rotateReverse: {
    id: 'rotateReverse',
    label: 'Rotate Reverse',
    category: 'transformación',
    duration: 600,
    easing: 'linear',
    keyframes: [
      { percent: 0, properties: { transform: 'rotate(0deg)' } },
      { percent: 100, properties: { transform: 'rotate(-360deg)' } },
    ],
  },
  flip: {
    id: 'flip',
    label: 'Flip',
    category: 'transformación',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: [
      { percent: 0, properties: { transform: 'rotateY(0deg)', opacity: '1' } },
      { percent: 100, properties: { transform: 'rotateY(360deg)', opacity: '1' } },
    ],
  },
  skew: {
    id: 'skew',
    label: 'Skew',
    category: 'transformación',
    duration: 600,
    easing: 'ease-out',
    keyframes: [
      { percent: 0, properties: { transform: 'skewY(0deg)', opacity: '1' } },
      { percent: 100, properties: { transform: 'skewY(-10deg)', opacity: '1' } },
    ],
  },
};

export const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Bounce' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Spring' },
];

export const ANIMATION_TRIGGERS = [
  { value: 'onLoad', label: 'Al Cargar' },
  { value: 'onHover', label: 'Al Pasar el Ratón' },
  { value: 'inView', label: 'Al Entrar en Vista' },
];
