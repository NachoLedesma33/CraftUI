import React, { useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';
import type { UIComponent, ComponentType, Styles, ResponsiveValue } from '@/types/canvas';
import type { Breakpoint } from '@/types/canvas';

type ElementTag = 'div' | 'span' | 'button' | 'img';

const componentTypeMap: Record<ComponentType, ElementTag> = {
  box: 'div',
  text: 'span',
  button: 'button',
  image: 'img',
  container: 'div',
  flex: 'div',
  grid: 'div',
};

const getBreakpointOrder = (device: 'mobile' | 'tablet' | 'desktop'): Breakpoint[] => {
  switch (device) {
    case 'mobile': return ['base'];
    case 'tablet': return ['base', 'tablet'];
    case 'desktop': return ['base', 'tablet', 'desktop'];
  }
};

const resolveStyleValue = <T,>(responsive: ResponsiveValue<T> | undefined, device: 'mobile' | 'tablet' | 'desktop'): T | undefined => {
  if (!responsive) return undefined;
  const order = getBreakpointOrder(device);
  for (const bp of order) {
    if (bp === 'base' && responsive.base !== undefined) return responsive.base;
    if (bp === 'tablet' && responsive.tablet !== undefined) return responsive.tablet;
    if (bp === 'desktop' && responsive.desktop !== undefined) return responsive.desktop;
  }
  return undefined;
};

const resolveStyles = (styles: Styles, device: 'mobile' | 'tablet' | 'desktop'): React.CSSProperties => {
  const resolved: React.CSSProperties = {};
  
  if (styles.display) resolved.display = resolveStyleValue(styles.display, device);
  if (styles.position) resolved.position = resolveStyleValue(styles.position, device);
  if (styles.flexDirection) resolved.flexDirection = resolveStyleValue(styles.flexDirection, device);
  if (styles.flexWrap) resolved.flexWrap = resolveStyleValue(styles.flexWrap, device);
  if (styles.justifyContent) resolved.justifyContent = resolveStyleValue(styles.justifyContent, device);
  if (styles.alignItems) resolved.alignItems = resolveStyleValue(styles.alignItems, device);
  if (styles.alignContent) resolved.alignContent = resolveStyleValue(styles.alignContent, device);
  if (styles.gap) resolved.gap = resolveStyleValue(styles.gap, device);
  if (styles.gridTemplateColumns) resolved.gridTemplateColumns = resolveStyleValue(styles.gridTemplateColumns, device);
  if (styles.gridTemplateRows) resolved.gridTemplateRows = resolveStyleValue(styles.gridTemplateRows, device);
  if (styles.gridColumn) resolved.gridColumn = resolveStyleValue(styles.gridColumn, device);
  if (styles.gridRow) resolved.gridRow = resolveStyleValue(styles.gridRow, device);
  
  if (styles.width) resolved.width = resolveStyleValue(styles.width, device);
  if (styles.height) resolved.height = resolveStyleValue(styles.height, device);
  if (styles.minWidth) resolved.minWidth = resolveStyleValue(styles.minWidth, device);
  if (styles.minHeight) resolved.minHeight = resolveStyleValue(styles.minHeight, device);
  if (styles.maxWidth) resolved.maxWidth = resolveStyleValue(styles.maxWidth, device);
  if (styles.maxHeight) resolved.maxHeight = resolveStyleValue(styles.maxHeight, device);
  
  if (styles.padding) resolved.padding = resolveStyleValue(styles.padding, device);
  if (styles.paddingTop) resolved.paddingTop = resolveStyleValue(styles.paddingTop, device);
  if (styles.paddingRight) resolved.paddingRight = resolveStyleValue(styles.paddingRight, device);
  if (styles.paddingBottom) resolved.paddingBottom = resolveStyleValue(styles.paddingBottom, device);
  if (styles.paddingLeft) resolved.paddingLeft = resolveStyleValue(styles.paddingLeft, device);
  if (styles.margin) resolved.margin = resolveStyleValue(styles.margin, device);
  if (styles.marginTop) resolved.marginTop = resolveStyleValue(styles.marginTop, device);
  if (styles.marginRight) resolved.marginRight = resolveStyleValue(styles.marginRight, device);
  if (styles.marginBottom) resolved.marginBottom = resolveStyleValue(styles.marginBottom, device);
  if (styles.marginLeft) resolved.marginLeft = resolveStyleValue(styles.marginLeft, device);
  
  if (styles.backgroundColor) resolved.backgroundColor = resolveStyleValue(styles.backgroundColor, device);
  if (styles.backgroundImage) resolved.backgroundImage = resolveStyleValue(styles.backgroundImage, device);
  if (styles.backgroundPosition) resolved.backgroundPosition = resolveStyleValue(styles.backgroundPosition, device);
  if (styles.backgroundSize) resolved.backgroundSize = resolveStyleValue(styles.backgroundSize, device);
  if (styles.backgroundRepeat) resolved.backgroundRepeat = resolveStyleValue(styles.backgroundRepeat, device);
  
  if (styles.borderWidth) resolved.borderWidth = resolveStyleValue(styles.borderWidth, device);
  if (styles.borderStyle) resolved.borderStyle = resolveStyleValue(styles.borderStyle, device);
  if (styles.borderColor) resolved.borderColor = resolveStyleValue(styles.borderColor, device);
  if (styles.borderRadius) resolved.borderRadius = resolveStyleValue(styles.borderRadius, device);
  if (styles.borderTopLeftRadius) resolved.borderTopLeftRadius = resolveStyleValue(styles.borderTopLeftRadius, device);
  if (styles.borderTopRightRadius) resolved.borderTopRightRadius = resolveStyleValue(styles.borderTopRightRadius, device);
  if (styles.borderBottomLeftRadius) resolved.borderBottomLeftRadius = resolveStyleValue(styles.borderBottomLeftRadius, device);
  if (styles.borderBottomRightRadius) resolved.borderBottomRightRadius = resolveStyleValue(styles.borderBottomRightRadius, device);
  
  if (styles.color) resolved.color = resolveStyleValue(styles.color, device);
  if (styles.fontSize) resolved.fontSize = resolveStyleValue(styles.fontSize, device);
  if (styles.fontWeight) resolved.fontWeight = resolveStyleValue(styles.fontWeight, device);
  if (styles.fontFamily) resolved.fontFamily = resolveStyleValue(styles.fontFamily, device);
  if (styles.lineHeight) resolved.lineHeight = resolveStyleValue(styles.lineHeight, device);
  if (styles.textAlign) resolved.textAlign = resolveStyleValue(styles.textAlign, device);
  if (styles.textDecoration) resolved.textDecoration = resolveStyleValue(styles.textDecoration, device);
  if (styles.textTransform) resolved.textTransform = resolveStyleValue(styles.textTransform, device);
  
  if (styles.opacity) resolved.opacity = resolveStyleValue(styles.opacity, device);
  if (styles.overflow) resolved.overflow = resolveStyleValue(styles.overflow, device);
  if (styles.overflowX) resolved.overflowX = resolveStyleValue(styles.overflowX, device);
  if (styles.overflowY) resolved.overflowY = resolveStyleValue(styles.overflowY, device);
  
  if (styles.boxShadow) resolved.boxShadow = resolveStyleValue(styles.boxShadow, device);
  if (styles.zIndex) resolved.zIndex = resolveStyleValue(styles.zIndex, device);
  if (styles.top) resolved.top = resolveStyleValue(styles.top, device);
  if (styles.right) resolved.right = resolveStyleValue(styles.right, device);
  if (styles.bottom) resolved.bottom = resolveStyleValue(styles.bottom, device);
  if (styles.left) resolved.left = resolveStyleValue(styles.left, device);
  
  if (styles.transition) resolved.transition = resolveStyleValue(styles.transition, device);
  if (styles.transform) resolved.transform = resolveStyleValue(styles.transform, device);
  if (styles.cursor) resolved.cursor = resolveStyleValue(styles.cursor, device);
  
  return resolved;
};

interface RendererProps {
  componentId: string;
  isPreview: boolean;
  onClick?: (id: string) => void;
  isRoot?: boolean;
}

interface EditWrapperProps {
  isSelected: boolean;
  isRoot: boolean;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  component: UIComponent;
}

const EditWrapper: React.FC<EditWrapperProps> = ({ isSelected, isRoot, children, onClick, component }) => {
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(component.id);
  }, [component.id, deleteComponent]);

  return (
    <div
      className="relative group"
      onClick={onClick}
      style={{ outline: 'none' }}
    >
      {children}
      
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          border: isSelected ? '2px dashed #3b82f6' : '1px solid transparent',
          opacity: isSelected ? 1 : 0,
        }}
      />
      
      {isSelected && (
        <>
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <span>{component.metadata.name}</span>
          </div>
          
          {!isRoot && (
            <button
              onClick={handleDelete}
              className="absolute -top-6 right-0 bg-red-500 text-white w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-red-600 pointer-events-auto"
            >
              ×
            </button>
          )}
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize pointer-events-auto" />
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize pointer-events-auto" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize pointer-events-auto" />
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize pointer-events-auto" />
        </>
      )}
    </div>
  );
};

const RendererInner: React.FC<RendererProps> = ({ componentId, isPreview, onClick, isRoot = false }) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const activeDevice = useUIStore((s) => s.view.activeDevice);
  
  const isSelected = useMemo(() => selectedIds.includes(componentId), [selectedIds, componentId]);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(componentId);
    useEditorStore.getState().selectComponent(componentId, e.shiftKey);
  }, [componentId, onClick]);
  
  if (!component) return null;
  
  const Tag = componentTypeMap[component.type];
  const inlineStyles = useMemo(
    () => resolveStyles(component.styles, activeDevice),
    [component.styles, activeDevice]
  );
  
  const childElements = useMemo(() => 
    component.children.map((childId) => (
      <RendererInner
        key={childId}
        componentId={childId}
        isPreview={isPreview}
        onClick={onClick}
        isRoot={false}
      />
    )),
    [component.children, isPreview, onClick]
  );
  
  const element = (
    <Tag
      id={componentId}
      style={inlineStyles}
      onClick={handleClick}
      {...component.props}
    >
      {component.type === 'text' && component.props.text}
      {childElements}
    </Tag>
  );
  
  if (isPreview) {
    return element;
  }
  
  return (
    <EditWrapper
      component={component}
      isSelected={isSelected}
      isRoot={isRoot}
      onClick={handleClick}
    >
      {element}
    </EditWrapper>
  );
};

export const Renderer = React.memo(RendererInner);