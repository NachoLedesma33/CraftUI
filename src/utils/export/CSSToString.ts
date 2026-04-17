import type { Styles, ResponsiveValue } from '@/types/canvas';

export interface TailwindConfig {
  prefix?: string;
  includeResponsive?: boolean;
}

const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

const tailwindValueMap: Record<string, string> = {
  'block': 'block',
  'inline': 'inline',
  'inline-block': 'inline-block',
  'flex': 'flex',
  'inline-flex': 'inline-flex',
  'grid': 'grid',
  'inline-grid': 'inline-grid',
  'none': 'hidden',
  'static': 'static',
  'relative': 'relative',
  'absolute': 'absolute',
  'fixed': 'fixed',
  'sticky': 'sticky',
  'row': 'flex-row',
  'column': 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'column-reverse': 'flex-col-reverse',
  'nowrap': 'flex-nowrap',
  'wrap': 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
  'stretch': 'stretch',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
  'center': 'center',
  'baseline': 'baseline',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
  'visible': 'visible',
  'hidden': 'hidden',
  'scroll': 'scroll',
  'auto': 'auto',
  'left': 'left',
  'right': 'right',
  'top': 'top',
  'bottom': 'bottom',
  'underline': 'underline',
  'line-through': 'line-through',
  'uppercase': 'uppercase',
  'lowercase': 'lowercase',
  'capitalize': 'capitalize',
  'text-left': 'text-left',
  'text-center': 'text-center',
  'text-right': 'text-right',
  'text-justify': 'text-justify',
  'cursor-pointer': 'cursor-pointer',
  'cursor-default': 'cursor-default',
  'cursor-move': 'cursor-move',
  'cursor-not-allowed': 'cursor-not-allowed',
  'cursor-text': 'cursor-text',
};

const tailwindSpacingMap: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '6',
  '6': '8',
  '8': '8',
  '10': '10',
  '12': '12',
  '16': '16',
  '20': '20',
  '24': '24',
  '32': '32',
  '40': '40',
  '48': '48',
  '56': '56',
  '64': '64',
  'px': '1',
  'full': 'full',
  'auto': 'auto',
  'screen': 'screen',
};

const mapValueToTailwind = (property: string, value: string): string | null => {
  const key = `${property}:${value}`;
  
  if (tailwindValueMap[key]) {
    return tailwindValueMap[key];
  }
  
  if (property === 'fontWeight') {
    const weights: Record<string, string> = {
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold',
      '900': 'font-black',
    };
    return weights[value] || null;
  }
  
  if (property === 'fontSize') {
    const sizes: Record<string, string> = {
      '12px': 'text-xs',
      '14px': 'text-sm',
      '16px': 'text-base',
      '18px': 'text-lg',
      '20px': 'text-xl',
      '24px': 'text-2xl',
      '30px': 'text-3xl',
      '36px': 'text-4xl',
      '48px': 'text-5xl',
      '60px': 'text-6xl',
    };
    return sizes[value] || null;
  }
  
  if (property === 'fontFamily') {
    const families: Record<string, string> = {
      'sans': 'font-sans',
      'serif': 'font-serif',
      'mono': 'font-mono',
    };
    return families[value] || 'font-sans';
  }
  
  return null;
};

const spacingToTailwind = (value: string): string => {
  const numMatch = value.match(/^(\d+(?:\.\d+)?)/);
  const unit = value.replace(numMatch?.[1] || '', '');
  
  if (unit === 'px' && numMatch) {
    const px = parseInt(numMatch[1]);
    if (px <= 64) {
      return tailwindSpacingMap[String(px)] || `[${px}px]`;
    }
    return `[${px}px]`;
  }
  
  if (unit === 'rem' && numMatch) {
    const rem = parseFloat(numMatch[1]);
    return `[${rem}rem]`;
  }
  
  if (unit === '%' && numMatch) {
    return `[${numMatch[1]}%]`;
  }
  
  if (unit === 'vh' && numMatch) {
    return `[${numMatch[1]}vh]`;
  }
  
  if (unit === 'vw' && numMatch) {
    return `[${numMatch[1]}vw]`;
  }
  
  return value;
};

const propertyToTailwindPrefix: Record<string, string> = {
  'padding': 'p',
  'paddingTop': 'pt',
  'paddingRight': 'pr',
  'paddingBottom': 'pb',
  'paddingLeft': 'pl',
  'margin': 'm',
  'marginTop': 'mt',
  'marginRight': 'mr',
  'marginBottom': 'mb',
  'marginLeft': 'ml',
  'width': 'w',
  'height': 'h',
  'minWidth': 'min-w',
  'minHeight': 'min-h',
  'maxWidth': 'max-w',
  'maxHeight': 'max-h',
  'gap': 'gap',
  'top': 'top',
  'right': 'right',
  'bottom': 'bottom',
  'left': 'left',
  'fontSize': 'text',
  'zIndex': 'z',
  'borderRadius': 'rounded',
  'borderTopLeftRadius': 'rounded-tl',
  'borderTopRightRadius': 'rounded-tr',
  'borderBottomLeftRadius': 'rounded-bl',
  'borderBottomRightRadius': 'rounded-br',
  'gridTemplateColumns': 'grid-cols',
  'gridTemplateRows': 'grid-rows',
};

const getBreakpointPrefix = (breakpoint: 'base' | 'tablet' | 'desktop'): string => {
  switch (breakpoint) {
    case 'base': return '';
    case 'tablet': return 'md:';
    case 'desktop': return 'lg:';
  }
};

export const styleObjectToInlineCSS = (styles: Partial<Styles>): string => {
  const cssRules: string[] = [];
  
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    if (typeof value === 'object' && 'base' in value) {
      const responsive = value as ResponsiveValue<unknown>;
      if (responsive.base !== undefined) {
        cssRules.push(`${camelToKebab(key)}: ${responsive.base};`);
      }
    } else {
      cssRules.push(`${camelToKebab(key)}: ${value};`);
    }
  }
  
  return cssRules.join(' ');
};

export const styleObjectToTailwind = (
  styles: Partial<Styles>,
  config: TailwindConfig = {}
): string => {
  const { prefix = '', includeResponsive = true } = config;
  const classes: string[] = [];
  
  for (const [property, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    if (typeof value === 'object' && 'base' in value) {
      const responsive = value as ResponsiveValue<unknown>;
      
      if (includeResponsive) {
        const breakpoints: ('base' | 'tablet' | 'desktop')[] = ['base', 'tablet', 'desktop'];
        
        for (const bp of breakpoints) {
          const bpValue = responsive[bp];
          if (bpValue === undefined) continue;
          
          const bpPrefix = getBreakpointPrefix(bp);
          
          if (property in propertyToTailwindPrefix) {
            const twPrefix = propertyToTailwindPrefix[property];
            const twValue = spacingToTailwind(String(bpValue));
            classes.push(`${prefix}${bpPrefix}${twPrefix}-${twValue}`);
          } else {
            const mapped = mapValueToTailwind(property, String(bpValue));
            if (mapped) {
              classes.push(`${prefix}${bpPrefix}${mapped}`);
            } else {
              classes.push(`${prefix}${bpPrefix}[${camelToKebab(property)}:${bpValue}]`);
            }
          }
        }
      } else {
        if (responsive.base !== undefined) {
          if (property in propertyToTailwindPrefix) {
            const twPrefix = propertyToTailwindPrefix[property];
            const twValue = spacingToTailwind(String(responsive.base));
            classes.push(`${prefix}${twPrefix}-${twValue}`);
          } else {
            const mapped = mapValueToTailwind(property, String(responsive.base));
            if (mapped) {
              classes.push(`${prefix}${mapped}`);
            }
          }
        }
      }
    } else {
      if (property in propertyToTailwindPrefix) {
        const twPrefix = propertyToTailwindPrefix[property];
        const twValue = spacingToTailwind(String(value));
        classes.push(`${prefix}${twPrefix}-${twValue}`);
      } else {
        const mapped = mapValueToTailwind(property, String(value));
        if (mapped) {
          classes.push(`${prefix}${mapped}`);
        }
      }
    }
  }
  
  return classes.filter(Boolean).join(' ');
};

export const generateResponsiveCSS = (styles: Partial<Styles>): string => {
  const baseCSS: string[] = [];
  const tabletCSS: string[] = [];
  const desktopCSS: string[] = [];
  
  const addToArray = (arr: string[], property: string, value: unknown) => {
    const css = `  ${camelToKebab(property)}: ${value};`;
    arr.push(css);
  };
  
  for (const [property, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    if (typeof value === 'object' && 'base' in value) {
      const responsive = value as ResponsiveValue<unknown>;
      
      if (responsive.base !== undefined) {
        addToArray(baseCSS, property, responsive.base);
      }
      if (responsive.tablet !== undefined) {
        addToArray(tabletCSS, property, responsive.tablet);
      }
      if (responsive.desktop !== undefined) {
        addToArray(desktopCSS, property, responsive.desktop);
      }
    } else {
      addToArray(baseCSS, property, value);
    }
  }
  
  let result = '';
  
  if (baseCSS.length > 0) {
    result += `.component {\n${baseCSS.join('\n')}\n}\n\n`;
  }
  
  if (tabletCSS.length > 0) {
    result += `@media (min-width: 768px) {\n  .component {\n${tabletCSS.join('\n')}\n  }\n}\n\n`;
  }
  
  if (desktopCSS.length > 0) {
    result += `@media (min-width: 1024px) {\n  .component {\n${desktopCSS.join('\n')}\n  }\n}\n`;
  }
  
  return result.trim();
};

export const styleObjectToCSSModule = (
  componentName: string,
  styles: Partial<Styles>
): string => {
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '_');
  
  const cssClasses: string[] = [];
  const classMap: string[] = [];
  
  let classIndex = 1;
  for (const [property, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    const className = `${safeName}_${classIndex}`;
    let cssContent = '';
    
    if (typeof value === 'object' && 'base' in value) {
      const responsive = value as ResponsiveValue<unknown>;
      const baseCSS: string[] = [];
      const tabletCSS: string[] = [];
      const desktopCSS: string[] = [];
      
      if (responsive.base !== undefined) {
        baseCSS.push(`  ${camelToKebab(property)}: ${responsive.base};`);
      }
      if (responsive.tablet !== undefined) {
        tabletCSS.push(`  ${camelToKebab(property)}: ${responsive.tablet};`);
      }
      if (responsive.desktop !== undefined) {
        desktopCSS.push(`  ${camelToKebab(property)}: ${responsive.desktop};`);
      }
      
      cssContent = `.${className} {\n${baseCSS.join('\n')}\n}`;
      
      if (tabletCSS.length > 0) {
        cssContent += `\n\n@media (min-width: 768px) {\n  .${className} {\n${tabletCSS.join('\n')}\n  }\n}`;
      }
      if (desktopCSS.length > 0) {
        cssContent += `\n\n@media (min-width: 1024px) {\n  .${className} {\n${desktopCSS.join('\n')}\n  }\n}`;
      }
    } else {
      cssContent = `.${className} {\n  ${camelToKebab(property)}: ${value};\n}`;
    }
    
    cssClasses.push(cssContent);
    classMap.push(`"${className}": "${className}"`);
    
    classIndex++;
  }
  
  const cssContent = cssClasses.join('\n\n');
  const mapContent = `export const styles = { ${classMap.join(', ')} };`;
  
  return `${cssContent}\n\n/* JS Map */\n/* ${mapContent} */`;
};

export const formatCSS = (
  css: string,
  options: { minify?: boolean; indent?: string } = {}
): string => {
  const { minify = false, indent = '  ' } = options;
  
  if (minify) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .trim();
  }
  
  let formatted = css;
  
  formatted = formatted.replace(/\s+/g, ' ');
  formatted = formatted.replace(/\s*{\s*/g, ' {\n');
  formatted = formatted.replace(/\s*}\s*/g, '\n}\n');
  formatted = formatted.replace(/\s*;\s*/g, ';\n');
  formatted = formatted.replace(/\n\s*\n/g, '\n');
  
  const lines = formatted.split('\n');
  let depth = 0;
  
  const result = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    if (trimmed.startsWith('}')) {
      depth = Math.max(0, depth - 1);
    }
    
    const indented = indent.repeat(depth) + trimmed;
    
    if (trimmed.endsWith('{')) {
      depth++;
    }
    
    return indented;
  }).join('\n');
  
  return result.trim();
};

export const extractAnimations = (styles: Partial<Styles>): string => {
  const animations: string[] = [];
  
  if (styles.transition) {
    const transition = typeof styles.transition === 'object' 
      ? styles.transition.base 
      : styles.transition;
    
    if (typeof transition === 'string' && transition.includes('animation')) {
      const match = transition.match(/@keyframes\s+(\w+)/g);
      if (match) {
        animations.push(...match.map(k => k.replace('@keyframes ', '')));
      }
    }
  }
  
  return animations.join('\n');
};

export const generateCSSFile = (
  components: Record<string, { styles: Partial<Styles>; metadata: { name: string } }>,
  options: { minify?: boolean; format?: 'standard' | 'module' | 'tailwind' } = {}
): string => {
  const { minify = false, format = 'standard' } = options;
  
  let result = '';
  
  for (const [id, component] of Object.entries(components)) {
    const className = component.metadata.name.replace(/[^a-zA-Z0-9]/g, '_') || `component_${id.slice(0, 8)}`;
    
    switch (format) {
      case 'standard':
        result += generateResponsiveCSS(component.styles).replace('.component', `.${className}`);
        result += '\n\n';
        break;
        
      case 'module':
        result += styleObjectToCSSModule(className, component.styles);
        result += '\n\n';
        break;
        
      case 'tailwind':
        const twClasses = styleObjectToTailwind(component.styles);
        if (twClasses) {
          result += `/* ${component.metadata.name} */\n.${className} { @apply ${twClasses}; }\n\n`;
        }
        break;
    }
  }
  
  return minify ? formatCSS(result, { minify: true }) : formatCSS(result);
};