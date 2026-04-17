export const ComponentType = {
  Box: 'box',
  Text: 'text',
  Button: 'button',
  Image: 'image',
  Container: 'container',
  Flex: 'flex',
  Grid: 'grid',
} as const;

export type ComponentType = typeof ComponentType[keyof typeof ComponentType];

export type Breakpoint = 'base' | 'tablet' | 'desktop';

export type ResponsiveValue<T> = {
  base: T;
  tablet?: T;
  desktop?: T;
};

export interface Styles {
  display?: ResponsiveValue<'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none'>;
  position?: ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  flexDirection?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
  flexWrap?: ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>;
  justifyContent?: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>;
  alignItems?: ResponsiveValue<'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'>;
  alignContent?: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch'>;
  gap?: ResponsiveValue<string>;
  gridTemplateColumns?: ResponsiveValue<string>;
  gridTemplateRows?: ResponsiveValue<string>;
  gridColumn?: ResponsiveValue<string>;
  gridRow?: ResponsiveValue<string>;

  width?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  minWidth?: ResponsiveValue<string>;
  minHeight?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  maxHeight?: ResponsiveValue<string>;

  padding?: ResponsiveValue<string>;
  paddingTop?: ResponsiveValue<string>;
  paddingRight?: ResponsiveValue<string>;
  paddingBottom?: ResponsiveValue<string>;
  paddingLeft?: ResponsiveValue<string>;
  margin?: ResponsiveValue<string>;
  marginTop?: ResponsiveValue<string>;
  marginRight?: ResponsiveValue<string>;
  marginBottom?: ResponsiveValue<string>;
  marginLeft?: ResponsiveValue<string>;

  backgroundColor?: ResponsiveValue<string>;
  backgroundImage?: ResponsiveValue<string>;
  backgroundPosition?: ResponsiveValue<string>;
  backgroundSize?: ResponsiveValue<string>;
  backgroundRepeat?: ResponsiveValue<string>;

  borderWidth?: ResponsiveValue<string>;
  borderStyle?: ResponsiveValue<'solid' | 'dashed' | 'dotted' | 'none'>;
  borderColor?: ResponsiveValue<string>;
  borderRadius?: ResponsiveValue<string>;
  borderTopLeftRadius?: ResponsiveValue<string>;
  borderTopRightRadius?: ResponsiveValue<string>;
  borderBottomLeftRadius?: ResponsiveValue<string>;
  borderBottomRightRadius?: ResponsiveValue<string>;

  color?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<string | number>;
  fontFamily?: ResponsiveValue<string>;
  lineHeight?: ResponsiveValue<string>;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  textDecoration?: ResponsiveValue<'none' | 'underline' | 'line-through'>;
  textTransform?: ResponsiveValue<'none' | 'uppercase' | 'lowercase' | 'capitalize'>;

  opacity?: ResponsiveValue<number>;
  overflow?: ResponsiveValue<'visible' | 'hidden' | 'scroll' | 'auto'>;
  overflowX?: ResponsiveValue<'visible' | 'hidden' | 'scroll' | 'auto'>;
  overflowY?: ResponsiveValue<'visible' | 'hidden' | 'scroll' | 'auto'>;

  boxShadow?: ResponsiveValue<string>;
  zIndex?: ResponsiveValue<number>;
  top?: ResponsiveValue<string>;
  right?: ResponsiveValue<string>;
  bottom?: ResponsiveValue<string>;
  left?: ResponsiveValue<string>;

  transition?: ResponsiveValue<string>;
  transform?: ResponsiveValue<string>;
  cursor?: ResponsiveValue<'auto' | 'default' | 'pointer' | 'not-allowed' | 'move' | 'text'>;

  animationName?: ResponsiveValue<string>;
  animationDuration?: ResponsiveValue<string>;
  animationDelay?: ResponsiveValue<string>;
  animationIterationCount?: ResponsiveValue<string | number>;
  animationTimingFunction?: ResponsiveValue<string>;
  animationFillMode?: ResponsiveValue<'none' | 'forwards' | 'backwards' | 'both'>;
}

export interface KeyframeStep {
  percent: number;
  properties: Record<string, string>;
}

export interface AnimationConfig {
  name: string;
  duration: number;
  delay: number;
  easing: string;
  iterations: number | 'infinite';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  trigger: 'onLoad' | 'onHover' | 'inView';
  keyframes?: KeyframeStep[];
}

export interface ComponentProps {
  text?: string;
  src?: string;
  href?: string;
  alt?: string;
  placeholder?: string;
  value?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export interface ComponentMetadata {
  isVisible: boolean;
  isLocked: boolean;
  name: string;
  isRenaming?: boolean;
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  styles: Styles;
  parent: string | null;
  children: string[];
  metadata: ComponentMetadata;
}