import type { ComponentType, Styles } from '@/types/canvas';

export interface ComponentBlueprint {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  category: 'basic' | 'layout' | 'media' | 'form';
  defaultStyles: Partial<Styles>;
  defaultProps: Record<string, unknown>;
}

export const componentBlueprints: ComponentBlueprint[] = [
  {
    type: 'box',
    label: 'Box',
    description: 'A generic container for grouping elements',
    icon: '□',
    category: 'basic',
    defaultStyles: {
      display: { base: 'block' },
      padding: { base: '16px' },
      backgroundColor: { base: '#f3f4f6' },
      borderRadius: { base: '8px' },
    },
    defaultProps: {},
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Add a text paragraph or heading',
    icon: 'T',
    category: 'basic',
    defaultStyles: {
      display: { base: 'block' },
      fontSize: { base: '16px' },
      color: { base: '#374151' },
    },
    defaultProps: { text: 'New Text' },
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Interactive clickable button',
    icon: '●',
    category: 'basic',
    defaultStyles: {
      display: { base: 'inline-block' },
      padding: { base: '8px 16px' },
      backgroundColor: { base: '#3b82f6' },
      color: { base: '#ffffff' },
      borderRadius: { base: '6px' },
      fontWeight: { base: '500' },
      cursor: { base: 'pointer' },
    },
    defaultProps: { text: 'Button', type: 'button' },
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Display an image from URL',
    icon: '◎',
    category: 'media',
    defaultStyles: {
      display: { base: 'block' },
      width: { base: '100%' },
      maxWidth: { base: '300px' },
      borderRadius: { base: '8px' },
    },
    defaultProps: { src: '', alt: 'Image' },
  },
  {
    type: 'container',
    label: 'Container',
    description: 'Full-width content container',
    icon: '▢',
    category: 'layout',
    defaultStyles: {
      display: { base: 'block' },
      width: { base: '100%' },
      padding: { base: '16px' },
    },
    defaultProps: {},
  },
  {
    type: 'flex',
    label: 'Flex Container',
    description: 'Flexible box layout container',
    icon: '≡',
    category: 'layout',
    defaultStyles: {
      display: { base: 'flex' },
      flexDirection: { base: 'row' },
      gap: { base: '8px' },
      padding: { base: '16px' },
      minHeight: { base: '80px' },
      backgroundColor: { base: '#f9fafb' },
      borderRadius: { base: '8px' },
      borderWidth: { base: '1px' },
      borderStyle: { base: 'dashed' },
      borderColor: { base: '#d1d5db' },
    },
    defaultProps: {},
  },
  {
    type: 'grid',
    label: 'Grid Container',
    description: 'CSS Grid layout container',
    icon: '⊞',
    category: 'layout',
    defaultStyles: {
      display: { base: 'grid' },
      gridTemplateColumns: { base: '1fr 1fr' },
      gap: { base: '8px' },
      padding: { base: '16px' },
      minHeight: { base: '120px' },
      backgroundColor: { base: '#f9fafb' },
      borderRadius: { base: '8px' },
      borderWidth: { base: '1px' },
      borderStyle: { base: 'dashed' },
      borderColor: { base: '#d1d5db' },
    },
    defaultProps: {},
  },
];

export const getBlueprintByType = (type: ComponentType): ComponentBlueprint | undefined => {
  return componentBlueprints.find((bp) => bp.type === type);
};

export const getBlueprintsByCategory = (category: ComponentBlueprint['category']): ComponentBlueprint[] => {
  return componentBlueprints.filter((bp) => bp.category === category);
};

export const categories = [
  { id: 'layout', label: 'Layout', icon: '▦' },
  { id: 'basic', label: 'Basic', icon: '□' },
  { id: 'media', label: 'Media', icon: '◎' },
  { id: 'form', label: 'Form', icon: '▢' },
] as const;