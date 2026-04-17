import type { UIComponent, ComponentType } from '@/types/canvas';
import { styleObjectToInlineCSS, styleObjectToTailwind, formatCSS } from './CSSToString';

export interface ReactExportOptions {
  styling: 'inline' | 'tailwind' | 'css-modules' | 'styled-components';
  typescript: boolean;
  prettify: boolean;
  componentName: string;
  generatePropsInterface: boolean;
}

const defaultReactOptions: ReactExportOptions = {
  styling: 'tailwind',
  typescript: true,
  prettify: true,
  componentName: 'GeneratedUI',
  generatePropsInterface: true,
};

const componentTypeToJSXTag: Record<ComponentType, string> = {
  box: 'div',
  text: 'span',
  button: 'button',
  image: 'img',
  container: 'div',
  flex: 'div',
  grid: 'div',
};

const escapeJSX = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const generateComponentId = (component: UIComponent): string => {
  const name = component.metadata.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, '_$&');
  return name.charAt(0).toUpperCase() + name.slice(1);
};

interface GeneratedFile {
  filename: string;
  content: string;
  type: 'tsx' | 'css' | 'json' | 'config';
}

interface ExportResult {
  files: GeneratedFile[];
  warnings: string[];
}

const generateInlineStyles = (component: UIComponent): string => {
  const styles = styleObjectToInlineCSS(component.styles);
  
  if (!styles) return '';
  
  const styleObject = styles.split(';').filter(Boolean).map(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (!property || !value) return null;
    const jsProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return `${jsProperty}: "${value}"`;
  }).filter(Boolean);
  
  if (styleObject.length === 0) return '';
  
  return `{${styleObject.join(', ')}}`;
};

const generateComponentProps = (component: UIComponent, options: ReactExportOptions): string => {
  const props: string[] = [];
  const tag = componentTypeToJSXTag[component.type];
  
  props.push(`<${tag}`);
  
  if (options.styling === 'tailwind') {
    const classes = styleObjectToTailwind(component.styles);
    if (classes) {
      props.push(`  className="${classes}"`);
    }
  } else if (options.styling === 'inline') {
    const inlineStyles = generateInlineStyles(component);
    if (inlineStyles) {
      props.push(`  style={${inlineStyles}}`);
    }
  }
  
  if (component.type === 'image') {
    if (component.props.src) {
      const isLocal = component.props.src.startsWith('./') || component.props.src.startsWith('/');
      props.push(`  src="${escapeJSX(component.props.src)}"`);
      if (isLocal) {
        props.push(`  // ⚠️ Image source is local. Update path for production.`);
      }
    }
    if (component.props.alt) {
      props.push(`  alt="${escapeJSX(component.props.alt)}"`);
    }
  }
  
  if (component.type === 'button') {
    if (component.props.type) {
      props.push(`  type="${component.props.type}"`);
    }
    if (component.props.disabled) {
      props.push(`  disabled`);
    }
  }
  
  return props.join('\n');
};

const generateTextContent = (component: UIComponent): string | null => {
  if (component.type === 'text' && component.props.text) {
    return escapeJSX(component.props.text);
  }
  if (component.type === 'button' && component.props.text) {
    return escapeJSX(component.props.text);
  }
  return null;
};

const generateJSXElement = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: ReactExportOptions,
  indent: number,
  usedClassNames: Set<string>
): string => {
  const indentStr = '  '.repeat(indent);
  const childIndent = '  '.repeat(indent + 1);
  const tag = componentTypeToJSXTag[component.type];
  
  const props = generateComponentProps(component, options);
  
  if (options.styling === 'css-modules') {
    const className = `comp_${component.id.slice(0, 8)}`;
    usedClassNames.add(className);
  }
  
  const textContent = generateTextContent(component);
  const children = component.children
    .map(childId => allComponents[childId])
    .filter(Boolean)
    .map(child => generateJSXElement(child, allComponents, options, indent + 1, usedClassNames))
    .filter(Boolean)
    .join('\n');
  
  if (!children && textContent) {
    return `${indentStr}<${tag}\n${indentStr}  ${props.replace(`<${tag}`, '').trim()}\n${indentStr}>\n${childIndent}${textContent}\n${indentStr}</${tag}>`;
  }
  
  if (!children && !textContent) {
    const selfClosing = !['div', 'span', 'button', 'p', 'section', 'article', 'main', 'header', 'footer', 'aside'].includes(tag);
    if (selfClosing) {
      return `${indentStr}<${tag}\n${indentStr}  ${props.replace(`<${tag}`, '').trim()} />`;
    }
    return `${indentStr}<${tag}\n${indentStr}  ${props.replace(`<${tag}`, '').trim()}\n${indentStr} />`;
  }
  
  return `${indentStr}<${tag}\n${indentStr}  ${props.replace(`<${tag}`, '').trim()}\n${childIndent}${children}\n${indentStr}</${tag}>`;
};

const generateCSSModulesFile = (
  components: Record<string, UIComponent>,
  rootId: string
): string => {
  const collectComponents = (id: string): UIComponent[] => {
    const component = components[id];
    if (!component) return [];
    const result = [component];
    for (const childId of component.children) {
      result.push(...collectComponents(childId));
    }
    return result;
  };
  
  const allComponents = collectComponents(rootId);
  const cssRules: string[] = [];
  
  for (const comp of allComponents) {
    const className = `comp_${comp.id.slice(0, 8)}`;
    const rules: string[] = [];
    
    for (const [key, value] of Object.entries(comp.styles)) {
      if (!value) continue;
      
      if (typeof value === 'object' && 'base' in value) {
        const rv = value as { base?: unknown; tablet?: unknown; desktop?: unknown };
        if (rv.base) {
          const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          rules.push(`  ${cssProperty}: ${rv.base};`);
        }
        if (rv.tablet) {
          rules.push(`  @media (min-width: 768px) {`);
          rules.push(`    ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${rv.tablet};`);
          rules.push(`  }`);
        }
        if (rv.desktop) {
          rules.push(`  @media (min-width: 1024px) {`);
          rules.push(`    ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${rv.desktop};`);
          rules.push(`  }`);
        }
      } else {
        const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        rules.push(`  ${cssProperty}: ${value};`);
      }
    }
    
    if (rules.length > 0) {
      cssRules.push(`.${className} {\n${rules.join('\n')}\n}`);
    }
  }
  
  return cssRules.join('\n\n');
};

const generateTailwindConfig = (): string => {
  return `// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
};

const generateStyledComponentsFile = (
  components: Record<string, UIComponent>,
  rootId: string
): string => {
  const collectComponents = (id: string): UIComponent[] => {
    const component = components[id];
    if (!component) return [];
    const result = [component];
    for (const childId of component.children) {
      result.push(...collectComponents(childId));
    }
    return result;
  };
  
  const allComponents = collectComponents(rootId);
  const styledDefinitions: string[] = [];
  
  for (const comp of allComponents) {
    const name = generateComponentId(comp);
    const tag = componentTypeToJSXTag[comp.type];
    
    const styles = styleObjectToInlineCSS(comp.styles);
    const cssProperties = styles.split(';').filter(Boolean).map(rule => {
      const [property] = rule.split(':').map(s => s.trim());
      if (!property) return null;
      return `  ${property};`;
    }).filter(Boolean).join('\n');
    
    if (cssProperties) {
      styledDefinitions.push(`const ${name} = styled.${tag}\`\n${cssProperties}\n\`;`);
    }
  }
  
  return `${styledDefinitions.join('\n\n')}`;
};

export const exportToReact = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ReactExportOptions> = {}
): ExportResult => {
  const opts = { ...defaultReactOptions, ...options };
  const warnings: string[] = [];
  const files: GeneratedFile[] = [];
  
  const root = components[rootId];
  if (!root) {
    return { files: [], warnings: ['Root component not found'] };
  }
  
  const usedClassNames = new Set<string>();
  
  const jsxContent = generateJSXElement(root, components, opts, 3, usedClassNames);
  
  const imports: string[] = [];
  imports.push(`import React from 'react';`);
  
  if (opts.styling === 'styled-components') {
    imports.push(`import styled from 'styled-components';`);
    const styledFile = generateStyledComponentsFile(components, rootId);
    files.push({
      filename: 'styled-components.ts',
      content: styledFile,
      type: 'tsx',
    });
  }
  
  if (opts.styling === 'css-modules') {
    const cssFile = generateCSSModulesFile(components, rootId);
    files.push({
      filename: `${opts.componentName}.module.css`,
      content: cssFile,
      type: 'css',
    });
    imports.push(`import styles from './${opts.componentName}.module.css';`);
  }
  
  let componentCode = '';
  
  if (opts.typescript && opts.generatePropsInterface) {
    componentCode += `interface ${opts.componentName}Props {\n`;
    componentCode += `  className?: string;\n`;
    componentCode += `}\n\n`;
  }
  
  const returnType = opts.typescript ? ': JSX.Element' : '';
  const propsType = opts.typescript ? 'Props' : '';
  
  componentCode += `export const ${opts.componentName} = (${opts.generatePropsInterface ? `props: ${opts.componentName}${propsType}` : ''})${returnType} => {\n`;
  componentCode += `  return (\n${jsxContent}\n  );\n`;
  componentCode += `};\n`;
  
  componentCode += `\n// Metadata\n`;
  componentCode += `export const ${opts.componentName}Metadata = {\n`;
  componentCode += `  name: '${escapeJSX(root.metadata.name)}',\n`;
  componentCode += `  type: '${root.type}',\n`;
  componentCode += `  children: ${root.children.length},\n`;
  componentCode += `};\n`;
  
  let fullCode = imports.join('\n') + '\n\n' + componentCode;
  
  if (opts.prettify) {
    fullCode = formatCSS(fullCode, { minify: false });
  }
  
  if (opts.styling === 'tailwind') {
    warnings.push('Remember to install Tailwind CSS in your project');
    warnings.push('Add @tailwind directives to your CSS file');
    
    files.push({
      filename: 'tailwind.config.js',
      content: generateTailwindConfig(),
      type: 'config',
    });
    
    files.push({
      filename: 'tailwind.usage.css',
      content: `/* Add to your main CSS file:
@tailwind base;
@tailwind components;
@tailwind utilities;
*/`,
      type: 'css',
    });
  }
  
  files.unshift({
    filename: opts.componentName + (opts.typescript ? '.tsx' : '.jsx'),
    content: fullCode,
    type: 'tsx',
  });
  
  const imageComponents = Object.values(components).filter(c => c.type === 'image' && c.props.src);
  if (imageComponents.length > 0) {
    warnings.push(`${imageComponents.length} image(s) detected. Verify all src paths work in production.`);
  }
  
  return { files, warnings };
};

export const exportToSingleFile = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ReactExportOptions> = {}
): string => {
  const { files } = exportToReact(components, rootId, options);
  return files[0]?.content || '';
};

export const downloadAllFiles = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ReactExportOptions> = {}
): void => {
  const { files } = exportToReact(components, rootId, options);
  
  for (const file of files) {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const copyToClipboard = async (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ReactExportOptions> = {}
): Promise<void> => {
  const mainFile = exportToSingleFile(components, rootId, options);
  await navigator.clipboard.writeText(mainFile);
};