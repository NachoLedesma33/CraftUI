import type { UIComponent, ComponentType } from '@/types/canvas';
import { styleObjectToInlineCSS } from './CSSToString';

export interface HTMLExportOptions {
  useClasses: boolean;
  minify: boolean;
  includeReset: boolean;
  includeGoogleFonts: boolean;
  addAriaLabels: boolean;
  componentName: string;
}

const defaultHTMLOptions: HTMLExportOptions = {
  useClasses: false,
  minify: false,
  includeReset: true,
  includeGoogleFonts: true,
  addAriaLabels: true,
  componentName: 'app',
};

const BASE_RESET = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
}

a {
  text-decoration: none;
  color: inherit;
}
`;

const GOOGLE_FONTS = {
  'Roboto': 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;700',
  'Lato': 'Lato:wght@400;500;700',
  'Montserrat': 'Montserrat:wght@400;500;600;700',
  'Poppins': 'Poppins:wght@400;500;600;700',
  'Inter': 'Inter:wght@400;500;600;700',
};

const componentTypeToHTMLTag: Record<ComponentType, string> = {
  box: 'div',
  text: 'span',
  button: 'button',
  image: 'img',
  container: 'div',
  flex: 'div',
  grid: 'div',
};

const escapeHTML = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const generateFontImport = (fontFamily: string): string | null => {
  const normalized = fontFamily.replace(/['"]/g, '').trim();
  
  for (const [name, weight] of Object.entries(GOOGLE_FONTS)) {
    if (normalized.toLowerCase().includes(name.toLowerCase())) {
      return `https://fonts.googleapis.com/css2?family=${weight}&display=swap`;
    }
  }
  
  return null;
};

const collectFonts = (components: Record<string, UIComponent>): string[] => {
  const fonts = new Set<string>();
  
  for (const component of Object.values(components)) {
    const fontFamily = component.styles.fontFamily;
    if (fontFamily) {
      const value = typeof fontFamily === 'object' && 'base' in fontFamily 
        ? fontFamily.base 
        : fontFamily;
      if (typeof value === 'string') {
        fonts.add(value);
      }
    }
  }
  
  return Array.from(fonts);
};

const generateFontLinks = (components: Record<string, UIComponent>): string => {
  const fonts = collectFonts(components);
  const links: string[] = [];
  
  for (const font of fonts) {
    const importUrl = generateFontImport(font);
    if (importUrl) {
      links.push(`<link rel="preconnect" href="https://fonts.googleapis.com">`);
      links.push(`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
      links.push(`<link href="${importUrl}" rel="stylesheet">`);
    }
  }
  
  if (links.length > 0) {
    return links.join('\n    ');
  }
  
  return `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
};

const generateHTMLAttributes = (
  component: UIComponent,
  options: HTMLExportOptions
): string => {
  const attrs: string[] = [];
  
  attrs.push(`data-component-id="${component.id}"`);
  attrs.push(`data-component-type="${component.type}"`);
  
  if (options.addAriaLabels && component.metadata.name) {
    attrs.push(`aria-label="${escapeHTML(component.metadata.name)}"`);
  }
  
  if (!component.metadata.isVisible) {
    attrs.push(`hidden`);
  }
  
  return attrs.join(' ');
};

const generateHTMLProps = (
  component: UIComponent,
  options: HTMLExportOptions
): { tag: string; attrs: string; content: string | null; selfClosing: boolean } => {
  const tag = componentTypeToHTMLTag[component.type];
  const attrs: string[] = [];
  let content: string | null = null;
  let selfClosing = false;
  
  const baseAttrs = generateHTMLAttributes(component, options);
  if (baseAttrs) {
    attrs.push(baseAttrs);
  }
  
  if (options.useClasses) {
    attrs.push(`class="${component.type}-${component.id.slice(0, 8)}"`);
  } else {
    const inlineStyles = styleObjectToInlineCSS(component.styles);
    if (inlineStyles) {
      attrs.push(`style="${inlineStyles}"`);
    }
  }
  
  if (component.type === 'image') {
    if (component.props.src) {
      attrs.push(`src="${escapeHTML(component.props.src)}"`);
    }
    if (component.props.alt) {
      attrs.push(`alt="${escapeHTML(component.props.alt)}"`);
    }
    selfClosing = true;
  }
  
  if (component.type === 'button') {
    if (component.props.type) {
      attrs.push(`type="${component.props.type}"`);
    }
    if (component.props.disabled) {
      attrs.push(`disabled`);
    }
    if (component.props.href) {
      attrs.push(`href="${escapeHTML(component.props.href)}"`);
    }
  }
  
  if (component.type === 'text') {
    content = escapeHTML(component.props.text);
  } else if (component.type === 'button' && component.props.text) {
    content = escapeHTML(component.props.text);
  }
  
  return {
    tag,
    attrs: attrs.join(' '),
    content,
    selfClosing,
  };
};

const generateClassName = (component: UIComponent): string => {
  const base = component.metadata.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${base || component.type}-${component.id.slice(0, 8)}`;
};

const generateCSSForComponent = (
  component: UIComponent
): string => {
  const className = generateClassName(component);
  const css: string[] = [];
  
  const baseRules: string[] = [];
  const tabletRules: string[] = [];
  const desktopRules: string[] = [];
  
  for (const [key, value] of Object.entries(component.styles)) {
    if (!value) continue;
    
    if (typeof value === 'object' && 'base' in value) {
      const rv = value as { base?: unknown; tablet?: unknown; desktop?: unknown };
      
      if (rv.base !== undefined) {
        baseRules.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${rv.base};`);
      }
      if (rv.tablet !== undefined) {
        tabletRules.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${rv.tablet};`);
      }
      if (rv.desktop !== undefined) {
        desktopRules.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${rv.desktop};`);
      }
    } else {
      baseRules.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
    }
  }
  
  css.push(`.${className} {`);
  css.push(...baseRules);
  css.push('}');
  
  if (tabletRules.length > 0) {
    css.push(`@media (min-width: 768px) {`);
    css.push(`  .${className} {`);
    css.push(...tabletRules);
    css.push('  }');
    css.push('}');
  }
  
  if (desktopRules.length > 0) {
    css.push(`@media (min-width: 1024px) {`);
    css.push(`  .${className} {`);
    css.push(...desktopRules);
    css.push('  }');
    css.push('}');
  }
  
  if (component.type === 'button') {
    css.push(`.${className}:hover {`);
    css.push('  opacity: 0.9;');
    css.push('}');
    
    css.push(`.${className}:active {`);
    css.push('  transform: scale(0.98);');
    css.push('}');
  }
  
  return css.join('\n');
};

const generateFullPageCSS = (
  components: Record<string, UIComponent>
): string => {
  const rules: string[] = [];
  
  const collectComponents = (id: string): UIComponent[] => {
    const component = components[id];
    if (!component) return [];
    
    const result = [component];
    for (const childId of component.children) {
      result.push(...collectComponents(childId));
    }
    return result;
  };
  
  for (const id of Object.keys(components)) {
    const allComps = collectComponents(id);
    for (const comp of allComps) {
      rules.push(generateCSSForComponent(comp));
    }
    break;
  }
  
  return rules.join('\n\n');
};

const renderComponentToHTML = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: HTMLExportOptions,
  indent: number = 0
): string => {
  const { tag, attrs, content, selfClosing } = generateHTMLProps(component, options);
  const indentStr = options.minify ? '' : '  '.repeat(indent);
  const newLine = options.minify ? '' : '\n';
  
  if (selfClosing) {
    return options.minify
      ? `<${tag} ${attrs}/>`
      : `${indentStr}<${tag} ${attrs}/>`;
  }
  
  const children = component.children
    .map(childId => {
      const child = allComponents[childId];
      if (!child) return '';
      return renderComponentToHTML(child, allComponents, options, indent + 1);
    })
    .filter(Boolean)
    .join(newLine);
  
  if (content && !children) {
    return options.minify
      ? `<${tag} ${attrs}>${content}</${tag}>`
      : `${indentStr}<${tag} ${attrs}>${content}</${tag}>`;
  }
  
  if (!content && children) {
    return options.minify
      ? `<${tag} ${attrs}>${children}</${tag}>`
      : `${indentStr}<${tag} ${attrs}>${newLine}${children}${newLine}${indentStr}</${tag}>`;
  }
  
  return options.minify
    ? `<${tag} ${attrs}>${content || ''}${children}</${tag}>`
    : `${indentStr}<${tag} ${attrs}>${newLine}${indentStr}  ${content || ''}${newLine}${children}${newLine}${indentStr}</${tag}>`;
};

const generateResponsiveStyles = (
  components: Record<string, UIComponent>
): string => {
  const styles: Record<string, Set<string>> = {};
  
  for (const component of Object.values(components)) {
    const className = generateClassName(component);
    const tabletStyles: string[] = [];
    const desktopStyles: string[] = [];
    
    for (const [key, value] of Object.entries(component.styles)) {
      if (!value || typeof value !== 'object') continue;
      
      const rv = value as { base?: unknown; tablet?: unknown; desktop?: unknown };
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      if (rv.tablet !== undefined) {
        tabletStyles.push(`  ${cssKey}: ${rv.tablet};`);
      }
      if (rv.desktop !== undefined) {
        desktopStyles.push(`  ${cssKey}: ${rv.desktop};`);
      }
    }
    
    if (tabletStyles.length > 0) {
      if (!styles['tablet']) styles['tablet'] = new Set();
      styles['tablet'].add(`@media (min-width: 768px) {\n  .${className} {\n${tabletStyles.join('\n')}\n  }\n}`);
    }
    
    if (desktopStyles.length > 0) {
      if (!styles['desktop']) styles['desktop'] = new Set();
      styles['desktop'].add(`@media (min-width: 1024px) {\n  .${className} {\n${desktopStyles.join('\n')}\n  }\n}`);
    }
  }
  
  return Object.values(styles)
    .flatMap(set => Array.from(set))
    .join('\n\n');
};

const minifyHTML = (html: string): string => {
  return html
    .replace(/\s+/g, ' ')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*<\s*/g, '<')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
};

export const exportToHTML = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<HTMLExportOptions> = {}
): string => {
  const opts = { ...defaultHTMLOptions, ...options };
  const root = components[rootId];
  
  if (!root) {
    return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n</head>\n<body>\n<p>Error: Root component not found</p>\n</body>\n</html>';
  }
  
  const htmlContent = renderComponentToHTML(root, components, opts, 0);
  const cssContent = opts.useClasses ? generateFullPageCSS(components) : '';
  const fontLinks = opts.includeGoogleFonts ? generateFontLinks(components) : '';
  
  let stylesSection = '';
  
  if (opts.useClasses) {
    const responsiveStyles = generateResponsiveStyles(components);
    stylesSection = `
    <style>
${opts.includeReset ? BASE_RESET : ''}
${cssContent}
${responsiveStyles}
    </style>`;
  }
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(opts.componentName)}</title>
${fontLinks}${stylesSection}
</head>
<body>
${htmlContent}
</body>
</html>`;
  
  if (opts.minify) {
    html = minifyHTML(html);
  }
  
  return html;
};

export const exportToHTMLFile = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<HTMLExportOptions> = {}
): { filename: string; content: string; mimeType: string } => {
  const opts = { ...defaultHTMLOptions, ...options };
  const content = exportToHTML(components, rootId, opts);
  
  return {
    filename: `${opts.componentName.toLowerCase().replace(/\s+/g, '-')}.html`,
    content,
    mimeType: 'text/html',
  };
};

export const downloadHTML = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<HTMLExportOptions> = {}
): void => {
  const { filename, content } = exportToHTMLFile(components, rootId, options);
  
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const copyHTMLToClipboard = async (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<HTMLExportOptions> = {}
): Promise<void> => {
  const content = exportToHTML(components, rootId, options);
  await navigator.clipboard.writeText(content);
};