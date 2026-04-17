import type { UIComponent, ComponentType } from '@/types/canvas';
import { styleObjectToInlineCSS, styleObjectToTailwind } from './CSSToString';

export type ExportFormat = 'react-tsx' | 'html' | 'tailwind' | 'styled-components';

export interface ExportOptions {
  format: ExportFormat;
  componentPrefix: string;
  useTypescript: boolean;
  minify: boolean;
  addComments: boolean;
}

const defaultOptions: ExportOptions = {
  format: 'react-tsx',
  componentPrefix: 'Component',
  useTypescript: true,
  minify: false,
  addComments: true,
};

const componentTypeToTag: Record<ComponentType, string> = {
  box: 'div',
  text: 'span',
  button: 'button',
  image: 'img',
  container: 'div',
  flex: 'div',
  grid: 'div',
};

const componentTypeToJSX = (type: ComponentType): string => {
  switch (type) {
    case 'box': return 'div';
    case 'text': return 'span';
    case 'button': return 'button';
    case 'image': return 'img';
    case 'container': return 'div';
    case 'flex': return 'div';
    case 'grid': return 'div';
  }
};

const escapeString = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
};

const generateComponentProps = (component: UIComponent, format: ExportFormat): string => {
  const props: string[] = [];
  
  if (format === 'react-tsx' || format === 'styled-components') {
    const jsxTag = componentTypeToJSX(component.type);
    props.push(jsxTag);
    
    const inlineStyles = styleObjectToInlineCSS(component.styles);
    if (inlineStyles) {
      props.push(`style={{${inlineStyles.split(';').filter(s => s.trim()).map(s => {
        const [key, value] = s.split(':').map(p => p.trim());
        if (!key || !value) return '';
        const jsKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return `${jsKey}: "${value}"`;
      }).join(', ')}}}`);
    }
    
    if (component.type === 'image' && component.props.src) {
      props.push(`src="${escapeString(component.props.src)}"`);
      props.push(`alt="${escapeString(component.props.alt) || ''}"`);
    }
    
    if (component.type === 'button' && component.props.type) {
      props.push(`type="${component.props.type}"`);
    }
    
    if (component.props.disabled) {
      props.push('disabled');
    }
    
    if (component.type === 'button' && component.props.href) {
      props.push(`href="${escapeString(component.props.href)}"`);
    }
    
    return props.join(' ');
  }
  
  if (format === 'tailwind') {
    const classes = styleObjectToTailwind(component.styles);
    const classAttr = classes ? ` class="${classes}"` : '';
    
    const extraAttrs: string[] = [];
    if (component.type === 'image' && component.props.src) {
      extraAttrs.push(`src="${escapeString(component.props.src)}"`);
      extraAttrs.push(`alt="${escapeString(component.props.alt) || ''}"`);
    }
    
    return extraAttrs.length > 0 ? `${classAttr} ${extraAttrs.join(' ')}` : classAttr;
  }
  
  if (format === 'html') {
    const inlineStyles = styleObjectToInlineCSS(component.styles);
    const styleAttr = inlineStyles ? ` style="${inlineStyles}"` : '';
    
    const extraAttrs: string[] = [];
    if (component.type === 'image' && component.props.src) {
      extraAttrs.push(`src="${escapeString(component.props.src)}"`);
      extraAttrs.push(`alt="${escapeString(component.props.alt) || ''}"`);
    }
    
    return `${styleAttr}${extraAttrs.length > 0 ? ' ' + extraAttrs.join(' ') : ''}`;
  }
  
  return '';
};

const generateComponentContent = (component: UIComponent): string => {
  if (component.type === 'text' && component.props.text) {
    return escapeString(component.props.text);
  }
  
  if (component.type === 'button' && component.props.text) {
    return escapeString(component.props.text);
  }
  
  return '';
};

export const generateReactComponent = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: Partial<ExportOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const tag = componentTypeToJSX(component.type);
  const name = `${opts.componentPrefix}_${component.id.slice(0, 8)}`;
  
  const children = component.children
    .map(childId => allComponents[childId])
    .filter(Boolean)
    .map(child => generateReactComponent(child, allComponents, opts))
    .join('\n');
  
  const props = generateComponentProps(component, 'react-tsx');
  const content = generateComponentContent(component);
  
  const imports = opts.useTypescript ? 'import React from \'react\';\n\n' : '';
  
  if (children) {
    return `${imports}export const ${name} = () => (
  <${props}>
${children.split('\n').map(line => '    ' + line).join('\n')}
  </${tag}>
);\n`;
  }
  
  if (content) {
    return `${imports}export const ${name} = () => (
  <${props}>
    {${JSON.stringify(content)}}
  </${tag}>
);\n`;
  }
  
  return `${imports}export const ${name} = () => <${props} />;\n`;
};

export const generateHTML = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: Partial<ExportOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const tag = componentTypeToTag[component.type];
  const props = generateComponentProps(component, 'html');
  const content = generateComponentContent(component);
  
  const children = component.children
    .map(childId => allComponents[childId])
    .filter(Boolean)
    .map(child => generateHTML(child, allComponents, opts))
    .join('\n');
  
  const indent = '  ';
  
  if (children) {
    return `<${tag}${props}>
${children.split('\n').map(line => indent + line).join('\n')}
</${tag}>`;
  }
  
  if (content) {
    return `<${tag}${props}>${content}</${tag}>`;
  }
  
  return `<${tag}${props}></${tag}>`;
};

export const generateTailwindComponent = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: Partial<ExportOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const tag = componentTypeToTag[component.type];
  const props = generateComponentProps(component, 'tailwind');
  const content = generateComponentContent(component);
  
  const children = component.children
    .map(childId => allComponents[childId])
    .filter(Boolean)
    .map(child => generateTailwindComponent(child, allComponents, opts))
    .join('\n');
  
  const indent = '  ';
  
  if (children) {
    return `<${tag}${props}>
${children.split('\n').map(line => indent + line).join('\n')}
</${tag}>`;
  }
  
  if (content) {
    return `<${tag}${props}>${content}</${tag}>`;
  }
  
  return `<${tag}${props}></${tag}>`;
};

export const generateStyledComponent = (
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
  options: Partial<ExportOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const name = `${opts.componentPrefix}_${component.id.slice(0, 8)}`;
  const tag = componentTypeToTag[component.type];
  
  const styles = styleObjectToInlineCSS(component.styles);
  
  let code = '';
  
  if (opts.addComments) {
    code += `// ${component.metadata.name}\n`;
  }
  
  code += `const ${name} = styled.${tag}\`
  ${styles.split(';').filter(s => s.trim()).map(s => s.trim()).join('\n  ')}
\`;\n\n`;
  
  const children = component.children
    .map(childId => allComponents[childId])
    .filter(Boolean)
    .map(child => generateStyledComponent(child, allComponents, opts))
    .join('\n');
  
  if (children) {
    code += `export const ${name}Container = () => (\n  <${name}>\n${children.split('\n').map(line => '    ' + line).join('\n')}\n  </${name}>\n);\n`;
  } else {
    code += `export const ${name}Container = () => <${name} />;\n`;
  }
  
  return code;
};

export const generateExport = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ExportOptions> = {}
): { code: string; filename: string; mimeType: string } => {
  const opts = { ...defaultOptions, ...options };
  const root = components[rootId];
  
  if (!root) {
    return { code: '', filename: 'export', mimeType: 'text/plain' };
  }
  
  let code = '';
  let filename = '';
  let mimeType = '';
  
  switch (opts.format) {
    case 'react-tsx':
      code = generateReactComponent(root, components, opts);
      filename = 'Component.tsx';
      mimeType = 'text/typescript';
      break;
      
    case 'html':
      code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported UI</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
${generateHTML(root, components, opts).split('\n').map(line => '  ' + line).join('\n')}
</body>
</html>`;
      filename = 'index.html';
      mimeType = 'text/html';
      break;
      
    case 'tailwind':
      code = `<!-- Tailwind Classes -->
<div class="${styleObjectToTailwind(root.styles)}">
${root.children
  .map(childId => components[childId])
  .filter(Boolean)
  .map(child => '  ' + generateTailwindComponent(child, components, opts))
  .join('\n')}
</div>

<!--
  Tailwind Classes for Root:
  ${styleObjectToTailwind(root.styles)}
-->`;
      filename = 'tailwind.html';
      mimeType = 'text/html';
      break;
      
    case 'styled-components':
      code = `import styled from 'styled-components';
\n${generateStyledComponent(root, components, opts)}`;
      filename = 'StyledComponent.tsx';
      mimeType = 'text/typescript';
      break;
  }
  
  return { code, filename, mimeType };
};

export const downloadExport = (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ExportOptions> = {}
): void => {
  const { code, filename, mimeType } = generateExport(components, rootId, options);
  
  const blob = new Blob([code], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const copyExportToClipboard = async (
  components: Record<string, UIComponent>,
  rootId: string,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const { code } = generateExport(components, rootId, options);
  await navigator.clipboard.writeText(code);
};