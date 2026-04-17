import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';

interface ResizeHandlesProps {
  componentId: string;
  isSelected: boolean;
}

type HandlePosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'right-center'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'left-center';

interface ResizeState {
  active: boolean;
  handle: HandlePosition | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  currentWidth: number;
  currentHeight: number;
}

const MIN_SIZE = 20;

const handlePositions: { position: HandlePosition; style: React.CSSProperties }[] = [
  { position: 'top-left', style: { top: -4, left: -4, cursor: 'nwse-resize' } },
  { position: 'top-center', style: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
  { position: 'top-right', style: { top: -4, right: -4, cursor: 'nesw-resize' } },
  { position: 'right-center', style: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
  { position: 'bottom-right', style: { bottom: -4, right: -4, cursor: 'nwse-resize' } },
  { position: 'bottom-center', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
  { position: 'bottom-left', style: { bottom: -4, left: -4, cursor: 'nesw-resize' } },
  { position: 'left-center', style: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
];

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ componentId, isSelected }) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);
  
  const zoom = useUIStore((s) => s.view.zoom);
  const gridSize = useUIStore((s) => s.view.gridSize);
  const snapToGrid = useUIStore((s) => s.view.snapToGrid);
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    active: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    currentWidth: 0,
    currentHeight: 0,
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const componentRef = useRef<HTMLDivElement | null>(null);
  
  const getCurrentSize = useCallback((): { width: number; height: number } => {
    if (!component) return { width: 100, height: 100 };
    
    const width = component.styles.width?.base || '100px';
    const height = component.styles.height?.base || '100px';
    
    const parseSize = (size: string): number => {
      if (size.endsWith('px')) return parseInt(size);
      if (size.endsWith('%')) {
        const parentWidth = componentRef.current?.parentElement?.offsetWidth || 800;
        return (parseInt(size) / 100) * parentWidth;
      }
      if (size.endsWith('rem')) return parseInt(size) * 16;
      if (size.endsWith('vw')) return (parseInt(size) / 100) * window.innerWidth;
      if (size.endsWith('vh')) return (parseInt(size) / 100) * window.innerHeight;
      return parseInt(size) || 100;
    };
    
    return {
      width: parseSize(width),
      height: parseSize(height),
    };
  }, [component]);

  const snapToGridValue = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handleResizeStart = useCallback((handle: HandlePosition, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const { width, height } = getCurrentSize();
    
    setResizeState({
      active: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: width,
      startHeight: height,
      currentWidth: width,
      currentHeight: height,
    });
    
    setIsResizing(true);
    setShowTooltip(true);
  }, [getCurrentSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.active || !resizeState.handle || !component) return;
    
    const deltaX = (e.clientX - resizeState.startX) / zoom;
    const deltaY = (e.clientY - resizeState.startY) / zoom;
    
    let newWidth = resizeState.startWidth;
    let newHeight = resizeState.startHeight;
    
    const handle = resizeState.handle;
    
    if (handle.includes('right')) {
      newWidth = resizeState.startWidth + deltaX;
    } else if (handle.includes('left')) {
      newWidth = resizeState.startWidth - deltaX;
    }
    
    if (handle.includes('bottom')) {
      newHeight = resizeState.startHeight + deltaY;
    } else if (handle.includes('top')) {
      newHeight = resizeState.startHeight - deltaY;
    }
    
    if (e.shiftKey && (handle.includes('left') || handle.includes('right'))) {
      const aspectRatio = resizeState.startWidth / resizeState.startHeight;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    newWidth = Math.max(MIN_SIZE, snapToGridValue(newWidth));
    newHeight = Math.max(MIN_SIZE, snapToGridValue(newHeight));
    
    setResizeState((prev) => ({
      ...prev,
      currentWidth: newWidth,
      currentHeight: newHeight,
    }));
    
    updateComponent(componentId, {
      styles: {
        ...component.styles,
        width: { base: `${newWidth}px` },
        height: { base: `${newHeight}px` },
      },
    });
  }, [resizeState, component, componentId, zoom, snapToGridValue, updateComponent]);

  const handleMouseUp = useCallback(() => {
    if (resizeState.active) {
      saveToHistory();
      setResizeState({
        active: false,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        currentWidth: 0,
        currentHeight: 0,
      });
      setIsResizing(false);
      setShowTooltip(false);
    }
  }, [resizeState.active, saveToHistory]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isSelected || !component) return null;

  return (
    <>
      {handlePositions.map(({ position, style }) => (
        <div
          key={position}
          className="absolute z-50 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm hover:bg-blue-100"
          style={{
            ...style,
            transform: style.transform || 'none',
          }}
          onMouseDown={(e) => handleResizeStart(position, e)}
        />
      ))}
      
      {showTooltip && (
        <div
          className="absolute z-50 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none"
          style={{
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {Math.round(resizeState.currentWidth)}px × {Math.round(resizeState.currentHeight)}px
        </div>
      )}
      
      <style>{`
        [data-resize-handle] {
          position: absolute;
          z-index: 50;
        }
      `}</style>
    </>
  );
};

interface ResizeOverlayProps {
  componentId: string;
  isSelected: boolean;
  children: React.ReactNode;
}

export const ResizeOverlay: React.FC<ResizeOverlayProps> = ({
  componentId,
  isSelected,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={overlayRef}
      className="relative"
      style={{ 
        width: '100%', 
        height: '100%',
      }}
    >
      {children}
      
      <ResizeHandles 
        componentId={componentId} 
        isSelected={isSelected} 
      />
    </div>
  );
};