import React, { useCallback, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import { ResizeHandles } from "./ResizeHandles";
import { AutoLayoutToolbar } from "./AutoLayoutToolbar";
import { GapHandles } from "./GapHandles";
import { ContextMenu } from "./ContextMenu";
import type {
  UIComponent,
  ComponentType,
  Styles,
  ResponsiveValue,
} from "@/types/canvas";
import type { Breakpoint } from "@/types/canvas";

type ElementTag = "div" | "span" | "button" | "img" | "input" | "textarea" | "select" | "table" | "pre" | "blockquote" | "hr" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "ul" | "ol" | "nav" | "header" | "footer" | "section" | "aside";

const componentTypeMap: Record<ComponentType, ElementTag> = {
  box: "div",
  text: "span",
  button: "button",
  image: "img",
  container: "div",
  flex: "div",
  grid: "div",
  input: "input",
  textarea: "textarea",
  select: "select",
  checkbox: "input",
  radio: "input",
  switch: "div",
  navbar: "nav",
  tabs: "div",
  accordion: "div",
  dropdown: "div",
  breadcrumbs: "nav",
  table: "table",
  card: "div",
  badge: "span",
  avatar: "img",
  chip: "span",
  tooltip: "div",
  alert: "div",
  toast: "div",
  modal: "div",
  progress: "div",
  skeleton: "div",
  sidebar: "aside",
  header: "header",
  footer: "footer",
  section: "section",
  hero: "section",
  "feature-grid": "div",
  heading: "h2",
  blockquote: "blockquote",
  list: "ul",
  "code-block": "pre",
  divider: "hr",
  video: "div",
  icon: "span",
  "icon-grid": "div",
  gallery: "div",
};

const getBreakpointOrder = (
  device: "mobile" | "tablet" | "desktop",
): Breakpoint[] => {
  switch (device) {
    case "mobile":
      return ["base"];
    case "tablet":
      return ["base", "tablet"];
    case "desktop":
      return ["base", "tablet", "desktop"];
  }
};

const hasBreakpointOverrides = (styles: Styles): Set<string> => {
  const overrides = new Set<string>();
  for (const value of Object.values(styles)) {
    if (value && typeof value === "object" && "base" in value) {
      const rv = value as { base: unknown; tablet?: unknown; desktop?: unknown };
      if (rv.tablet !== undefined) overrides.add("tablet");
      if (rv.desktop !== undefined) overrides.add("desktop");
      if (overrides.size >= 2) break;
    }
  }
  return overrides;
};

const resolveStyleValue = <T,>(
  responsive: ResponsiveValue<T> | undefined,
  device: "mobile" | "tablet" | "desktop",
): T | undefined => {
  if (!responsive) return undefined;
  const order = getBreakpointOrder(device);
  for (const bp of order) {
    if (bp === "base" && responsive.base !== undefined) return responsive.base;
    if (bp === "tablet" && responsive.tablet !== undefined)
      return responsive.tablet;
    if (bp === "desktop" && responsive.desktop !== undefined)
      return responsive.desktop;
  }
  return undefined;
};

const resolveStyles = (
  styles: Styles,
  device: "mobile" | "tablet" | "desktop",
): React.CSSProperties => {
  const resolved: React.CSSProperties = {};

  if (styles.display)
    resolved.display = resolveStyleValue(styles.display, device);
  if (styles.position)
    resolved.position = resolveStyleValue(styles.position, device);
  if (styles.flexDirection)
    resolved.flexDirection = resolveStyleValue(styles.flexDirection, device);
  if (styles.flexWrap)
    resolved.flexWrap = resolveStyleValue(styles.flexWrap, device);
  if (styles.justifyContent)
    resolved.justifyContent = resolveStyleValue(styles.justifyContent, device);
  if (styles.alignItems)
    resolved.alignItems = resolveStyleValue(styles.alignItems, device);
  if (styles.alignContent)
    resolved.alignContent = resolveStyleValue(styles.alignContent, device);
  if (styles.gap) resolved.gap = resolveStyleValue(styles.gap, device);
  if (styles.gridTemplateColumns)
    resolved.gridTemplateColumns = resolveStyleValue(
      styles.gridTemplateColumns,
      device,
    );
  if (styles.gridTemplateRows)
    resolved.gridTemplateRows = resolveStyleValue(
      styles.gridTemplateRows,
      device,
    );
  if (styles.gridColumn)
    resolved.gridColumn = resolveStyleValue(styles.gridColumn, device);
  if (styles.gridRow)
    resolved.gridRow = resolveStyleValue(styles.gridRow, device);

  if (styles.width) resolved.width = resolveStyleValue(styles.width, device);
  if (styles.height) resolved.height = resolveStyleValue(styles.height, device);
  if (styles.minWidth)
    resolved.minWidth = resolveStyleValue(styles.minWidth, device);
  if (styles.minHeight)
    resolved.minHeight = resolveStyleValue(styles.minHeight, device);
  if (styles.maxWidth)
    resolved.maxWidth = resolveStyleValue(styles.maxWidth, device);
  if (styles.maxHeight)
    resolved.maxHeight = resolveStyleValue(styles.maxHeight, device);

  if (styles.padding)
    resolved.padding = resolveStyleValue(styles.padding, device);
  if (styles.paddingTop)
    resolved.paddingTop = resolveStyleValue(styles.paddingTop, device);
  if (styles.paddingRight)
    resolved.paddingRight = resolveStyleValue(styles.paddingRight, device);
  if (styles.paddingBottom)
    resolved.paddingBottom = resolveStyleValue(styles.paddingBottom, device);
  if (styles.paddingLeft)
    resolved.paddingLeft = resolveStyleValue(styles.paddingLeft, device);
  if (styles.margin) resolved.margin = resolveStyleValue(styles.margin, device);
  if (styles.marginTop)
    resolved.marginTop = resolveStyleValue(styles.marginTop, device);
  if (styles.marginRight)
    resolved.marginRight = resolveStyleValue(styles.marginRight, device);
  if (styles.marginBottom)
    resolved.marginBottom = resolveStyleValue(styles.marginBottom, device);
  if (styles.marginLeft)
    resolved.marginLeft = resolveStyleValue(styles.marginLeft, device);

  if (styles.backgroundColor)
    resolved.backgroundColor = resolveStyleValue(
      styles.backgroundColor,
      device,
    );
  if (styles.backgroundImage)
    resolved.backgroundImage = resolveStyleValue(
      styles.backgroundImage,
      device,
    );
  if (styles.backgroundPosition)
    resolved.backgroundPosition = resolveStyleValue(
      styles.backgroundPosition,
      device,
    );
  if (styles.backgroundSize)
    resolved.backgroundSize = resolveStyleValue(styles.backgroundSize, device);
  if (styles.backgroundRepeat)
    resolved.backgroundRepeat = resolveStyleValue(
      styles.backgroundRepeat,
      device,
    );

  if (styles.borderWidth)
    resolved.borderWidth = resolveStyleValue(styles.borderWidth, device);
  if (styles.borderStyle)
    resolved.borderStyle = resolveStyleValue(styles.borderStyle, device);
  if (styles.borderColor)
    resolved.borderColor = resolveStyleValue(styles.borderColor, device);
  if (styles.borderRadius)
    resolved.borderRadius = resolveStyleValue(styles.borderRadius, device);
  if (styles.borderTopLeftRadius)
    resolved.borderTopLeftRadius = resolveStyleValue(
      styles.borderTopLeftRadius,
      device,
    );
  if (styles.borderTopRightRadius)
    resolved.borderTopRightRadius = resolveStyleValue(
      styles.borderTopRightRadius,
      device,
    );
  if (styles.borderBottomLeftRadius)
    resolved.borderBottomLeftRadius = resolveStyleValue(
      styles.borderBottomLeftRadius,
      device,
    );
  if (styles.borderBottomRightRadius)
    resolved.borderBottomRightRadius = resolveStyleValue(
      styles.borderBottomRightRadius,
      device,
    );

  if (styles.color) resolved.color = resolveStyleValue(styles.color, device);
  if (styles.fontSize)
    resolved.fontSize = resolveStyleValue(styles.fontSize, device);
  if (styles.fontWeight)
    resolved.fontWeight = resolveStyleValue(styles.fontWeight, device);
  if (styles.fontFamily)
    resolved.fontFamily = resolveStyleValue(styles.fontFamily, device);
  if (styles.lineHeight)
    resolved.lineHeight = resolveStyleValue(styles.lineHeight, device);
  if (styles.textAlign)
    resolved.textAlign = resolveStyleValue(styles.textAlign, device);
  if (styles.textDecoration)
    resolved.textDecoration = resolveStyleValue(styles.textDecoration, device);
  if (styles.textTransform)
    resolved.textTransform = resolveStyleValue(styles.textTransform, device);

  if (styles.opacity)
    resolved.opacity = resolveStyleValue(styles.opacity, device);
  if (styles.overflow)
    resolved.overflow = resolveStyleValue(styles.overflow, device);
  if (styles.overflowX)
    resolved.overflowX = resolveStyleValue(styles.overflowX, device);
  if (styles.overflowY)
    resolved.overflowY = resolveStyleValue(styles.overflowY, device);

  if (styles.boxShadow)
    resolved.boxShadow = resolveStyleValue(styles.boxShadow, device);
  if (styles.zIndex) resolved.zIndex = resolveStyleValue(styles.zIndex, device);
  if (styles.top) resolved.top = resolveStyleValue(styles.top, device);
  if (styles.right) resolved.right = resolveStyleValue(styles.right, device);
  if (styles.bottom) resolved.bottom = resolveStyleValue(styles.bottom, device);
  if (styles.left) resolved.left = resolveStyleValue(styles.left, device);

  if (styles.transition)
    resolved.transition = resolveStyleValue(styles.transition, device);
  if (styles.transform)
    resolved.transform = resolveStyleValue(styles.transform, device);
  if (styles.cursor) resolved.cursor = resolveStyleValue(styles.cursor, device);

  // Animation styles
  if (styles.animationName)
    resolved.animationName = resolveStyleValue(styles.animationName, device);
  if (styles.animationDuration)
    resolved.animationDuration = resolveStyleValue(
      styles.animationDuration,
      device,
    );
  if (styles.animationDelay)
    resolved.animationDelay = resolveStyleValue(styles.animationDelay, device);
  if (styles.animationIterationCount)
    resolved.animationIterationCount = resolveStyleValue(
      styles.animationIterationCount,
      device,
    );
  if (styles.animationTimingFunction)
    resolved.animationTimingFunction = resolveStyleValue(
      styles.animationTimingFunction,
      device,
    );
  if (styles.animationFillMode)
    resolved.animationFillMode = resolveStyleValue(
      styles.animationFillMode,
      device,
    );

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
  onDoubleClick?: (e: React.MouseEvent) => void;
  component: UIComponent;
}

const areEditWrapperPropsEqual = (prev: Readonly<EditWrapperProps>, next: Readonly<EditWrapperProps>) => {
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.isRoot !== next.isRoot) return false;
  if (prev.children !== next.children) return false;
  if (prev.component.id !== next.component.id) return false;
  return prev.component === next.component;
};

const deviceMap: Record<string, string> = {
  mobile: "base",
  tablet: "tablet",
  desktop: "desktop",
};

const BREAKPOINT_DOTS: { id: string; label: string; color: string }[] = [
  { id: "base", label: "Base", color: "bg-slate-400" },
  { id: "tablet", label: "Tablet", color: "bg-blue-400" },
  { id: "desktop", label: "Desktop", color: "bg-green-400" },
];

const EditWrapper = React.memo<EditWrapperProps>(({
  isSelected,
  isRoot,
  children,
  onClick,
  onDoubleClick,
  component,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const endRenaming = useEditorStore((s) => s.endRenaming);
  const cancelRenaming = useEditorStore((s) => s.cancelRenaming);
  const lastAddedId = useUIStore((s) => s.lastAddedId);
  const statePreview = useUIStore((s) => s.statePreview);
  const hiddenOnDevices = useUIStore((s) => s.hiddenOnDevices);
  const activeDevice = useUIStore((s) => s.view.activeDevice);
  const isNew = component.id === lastAddedId;
  const overrides = useMemo(() => hasBreakpointOverrides(component.styles), [component.styles]);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: { type: "existing", componentId: component.id, component },
    disabled: isRoot,
  });

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteComponent(component.id);
    },
    [component.id, deleteComponent],
  );

  const handleRenameSubmit = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      input.focus();
      input.select();
      const finish = () => endRenaming(component.id, input.value);
      const cancel = () => cancelRenaming(component.id);
      input.onkeydown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter') finish();
        else if (e.key === 'Escape') cancel();
      };
      input.onblur = finish;
    }
  }, [component.id, endRenaming, cancelRenaming]);

  const dragStyle: React.CSSProperties = useMemo(() => {
    if (!transform || isDragging) return {};
    return {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    };
  }, [transform, isDragging]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      data-component-id={component.id}
      ref={setNodeRef}
      className={`relative group ${isSelected ? "" : ""}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={handleContextMenu}
      style={{ outline: "none", ...dragStyle }}
      {...(isSelected && !isRoot ? listeners : {})}
      {...(isSelected && !isRoot ? attributes : {})}
    >
      {children}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          componentId={component.id}
          onClose={() => setContextMenu(null)}
        />
      )}

      {isNew && (
        <div className="absolute -inset-1 pointer-events-none z-10 animate-new-component" />
      )}

      {/* Editor outline (subtle) + selection border */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150"
        style={{
          border: isSelected ? "2px dashed #8b5cf6" : "1px solid rgba(148, 163, 184, 0.15)",
          opacity: isSelected ? 1 : (isRoot ? 0 : 0.4),
          borderRadius: '4px',
          transition: 'border-color 0.15s, opacity 0.15s',
        }}
      />

      {isSelected && (
        <div className="absolute -top-6 left-0 bg-violet-500 text-white text-xs px-2 py-0.5 flex items-center gap-1.5 border-[var(--border)] pointer-events-none">
          <span className="cursor-grab active:cursor-grabbing" {...(!isRoot ? listeners : {})}>⠿</span>
          {component.metadata.isRenaming ? (
            <input
              ref={handleRenameSubmit}
              defaultValue={component.metadata.name}
              className="w-24 bg-slate-700 text-white text-xs px-1 py-0 border border-violet-300 outline-none"
            />
          ) : (
            <span>{component.metadata.name}</span>
          )}

          {/* Responsive indicators */}
          <div className="flex items-center gap-0.5 ml-1.5">
            {BREAKPOINT_DOTS.map((bp) => (
              <div
                key={bp.id}
                className={`w-1.5 h-1.5 rounded-full ${
                  bp.id === deviceMap[activeDevice]
                    ? "bg-white"
                    : overrides.has(bp.id)
                      ? bp.color
                      : "bg-white/20"
                }`}
                title={`${bp.label}: ${overrides.has(bp.id) ? "Has custom values" : "No custom values"}`}
              />
            ))}
          </div>

          {/* State preview buttons */}
          <div className="flex items-center gap-0.5 ml-2 pointer-events-auto">
            {(["default", "hover", "active", "focus"] as const).map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  useUIStore.getState().setStatePreview(s);
                }}
                className={`px-1 py-0 text-[9px] uppercase font-bold border border-white/30 transition-colors ${
                  statePreview === s
                    ? "bg-white text-violet-700"
                    : "hover:bg-white/20"
                }`}
              >
                {s === "default" ? "⚪" : s === "hover" ? "H" : s === "active" ? "A" : "F"}
              </button>
            ))}
          </div>

          {/* Hide on device toggle */}
          {!isRoot && (
            <div className="flex items-center gap-0.5 ml-1 pointer-events-auto">
              {["mobile", "tablet", "desktop"].map((dev) => {
                const bpKey = deviceMap[dev];
                const isHidden = hiddenOnDevices[component.id]?.includes(bpKey);
                return (
                  <button
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      useUIStore.getState().setHiddenOnDevice(
                        component.id,
                        bpKey,
                        !isHidden,
                      );
                    }}
                    className={`px-1 py-0 text-[8px] font-bold border border-white/30 transition-colors ${
                      isHidden
                        ? "bg-red-500 text-white"
                        : "hover:bg-white/20"
                    }`}
                    title={`${isHidden ? "Show" : "Hide"} on ${dev}`}
                  >
                    {dev === "mobile" ? "📱" : dev === "tablet" ? "📐" : "💻"}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* State preview overlay */}
      {isSelected && statePreview !== "default" && (
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            backgroundColor:
              statePreview === "hover"
                ? "rgba(59, 130, 246, 0.08)"
                : statePreview === "active"
                  ? "rgba(34, 197, 94, 0.08)"
                  : "rgba(234, 179, 8, 0.08)",
            outline:
              statePreview === "focus"
                ? "2px solid rgba(234, 179, 8, 0.5)"
                : "none",
            outlineOffset: 2,
          }}
        />
      )}

      {/* Delete button */}
      {isSelected && !isRoot && (
        <button
          onClick={handleDelete}
          className="absolute -top-6 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 pointer-events-auto transition-colors"
        >
          ×
        </button>
      )}

      {/* Auto-layout toolbar */}
      {isSelected && <AutoLayoutToolbar componentId={component.id} />}

      {/* Gap handles for flex containers */}
      <GapHandles componentId={component.id} isSelected={isSelected} />

      {/* Functional resize handles */}
      <ResizeHandles componentId={component.id} isSelected={isSelected && !isRoot} />
    </div>
  );
}, areEditWrapperPropsEqual);

const RendererInner: React.FC<RendererProps> = ({
  componentId,
  isPreview,
  onClick,
  isRoot = false,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const activeDevice = useUIStore((s) => s.view.activeDevice);
  const hiddenOnDevices = useUIStore((s) => s.hiddenOnDevices);
  const isHiddenOnDevice = component ? hiddenOnDevices[component.id]?.includes(deviceMap[activeDevice]) : false;

  const isSelected = useMemo(
    () => selectedIds.includes(componentId),
    [selectedIds, componentId],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(componentId);
      useEditorStore.getState().selectComponent(componentId, e.shiftKey);
    },
    [componentId, onClick],
  );

  const inlineStyles = useMemo(
    () => (component ? resolveStyles(component.styles, activeDevice) : {}),
    [component?.styles, activeDevice],
  );

  const childElements = useMemo(
    () =>
      component
        ? component.children.map((childId) => (
            <RendererInner
              key={childId}
              componentId={childId}
              isPreview={isPreview}
              onClick={onClick}
              isRoot={false}
            />
          ))
        : [],
    [component?.children, isPreview, onClick],
  );

  const updateComponent = useEditorStore((s) => s.updateComponent);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);

  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineText, setInlineText] = useState(
    component?.type === "text" ? (component?.props.text as string) || "" : ""
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (component?.type !== "text") return;
    e.stopPropagation();
    setIsEditingInline(true);
    setInlineText((component.props.text as string) || "");
  }, [component]);

  const finishInlineEdit = useCallback(() => {
    if (component?.type === "text" && inlineText !== component.props.text) {
      updateComponent(component.id, {
        props: { ...component.props, text: inlineText },
      });
      saveToHistory();
    }
    setIsEditingInline(false);
  }, [component, inlineText, updateComponent, saveToHistory]);

  if (!component) return null;

  if (isHiddenOnDevice) return null;

  const rawTag = componentTypeMap[component.type];
  // Override heading tag based on level prop; list tag based on ordered prop
  const Tag: ElementTag = component.type === "heading"
    ? (`h${Math.min(6, Math.max(1, (component.props.level as number) || 2))}` as ElementTag)
    : component.type === "list"
      ? ((component.props.ordered ? "ol" : "ul") as ElementTag)
      : rawTag;
  const isSelfClosing = ["img", "hr", "input"].includes(Tag);
  const isFormControl = ["input", "textarea", "select"].includes(component.type);
  const textProp = component.props.text as string | undefined;
  const itemsProp = component.props.items as string | undefined;
  const labelProp = component.props.label as string | undefined;
  const placeholderProp = component.props.placeholder as string | undefined;

  const renderTextContent = () => {
    if (component.type === "text" && isEditingInline) {
      return (
        <input
          autoFocus
          value={inlineText}
          onChange={(e) => setInlineText(e.target.value)}
          onBlur={finishInlineEdit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") finishInlineEdit();
            if (e.key === "Escape") { setIsEditingInline(false); }
          }}
          className="w-full bg-transparent border-none outline-none text-inherit font-inherit"
          style={{ all: "unset", width: "100%", display: "inline-block" }}
        />
      );
    }
    if (["text", "heading", "blockquote", "code-block", "badge", "chip", "alert", "toast", "modal", "accordion"].includes(component.type) && textProp) {
      return textProp;
    }
    if (["button", "header", "footer", "section", "hero", "tooltip", "dropdown"].includes(component.type) && textProp) {
      return textProp;
    }
    return null;
  };

  const renderFormControl = () => {
    if (component.type === "input" || component.type === "checkbox" || component.type === "radio") {
      return null;
    }
    if (component.type === "textarea") {
      return placeholderProp || "";
    }
    if (component.type === "select" && itemsProp) {
      return itemsProp.split("\n").map((opt, i) => (
        <option key={i} value={opt.trim()}>{opt.trim()}</option>
      ));
    }
    return null;
  };

  const renderListItems = () => {
    if (component.type !== "list" || !itemsProp) return null;
    return itemsProp.split("\n").filter(Boolean).map((item, i) => <li key={i}>{item.trim()}</li>);
  };

  const renderTable = () => {
    if (component.type !== "table") return null;
    const cols = (component.props.columns as string || "").split(",").map(c => c.trim());
    const rows = (itemsProp || "").split("\n").filter(Boolean).map(r => r.split(",").map(c => c.trim()));
    return (
      <>
        <thead>
          <tr>
            {cols.map((col, i) => <th key={i} style={{ padding: "8px", borderBottom: "1px solid #d1d5db", textAlign: "left", fontWeight: 600 }}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci} style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </>
    );
  };

  const renderSwitch = () => {
    if (component.type !== "switch") return null;
    const checked = component.props.checked as boolean;
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
        <div style={{
          width: "36px", height: "20px", borderRadius: "10px",
          backgroundColor: checked ? "#8b5cf6" : "#d1d5db",
          position: "relative", transition: "background-color 0.2s",
        }}>
          <div style={{
            width: "16px", height: "16px", borderRadius: "50%",
            backgroundColor: "#fff", position: "absolute", top: "2px",
            left: checked ? "18px" : "2px", transition: "left 0.2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }} />
        </div>
        {labelProp && <span>{labelProp}</span>}
      </div>
    );
  };

  const inputProps: Record<string, unknown> = {};
  if (isFormControl) {
    if (component.type === "input") {
      inputProps.type = (component.props.type as string) || "text";
      inputProps.placeholder = placeholderProp;
    } else if (component.type === "checkbox") {
      inputProps.type = "checkbox";
      inputProps.checked = component.props.checked;
    } else if (component.type === "radio") {
      inputProps.type = "radio";
      inputProps.checked = component.props.checked;
    } else if (component.type === "textarea") {
      inputProps.placeholder = placeholderProp;
      inputProps.rows = component.props.rows;
    }
  }
  if (component.type === "image" || component.type === "avatar") {
    inputProps.src = component.props.src;
    inputProps.alt = component.props.alt || "";
  }

  const isCheckOrRadio = component.type === "checkbox" || component.type === "radio";

  const element = isCheckOrRadio ? (
    <div
      id={`c-${componentId}`}
      data-component-id={componentId}
      style={{ ...inlineStyles as React.CSSProperties, display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
      onClick={handleClick}
    >
      <input
        type={component.type === "checkbox" ? "checkbox" : "radio"}
        checked={component.props.checked as boolean}
        readOnly
        style={{ cursor: "pointer" }}
      />
      {labelProp && <span>{labelProp}</span>}
      {childElements}
    </div>
  ) : (
    <Tag
      id={`c-${componentId}`}
      data-component-id={componentId}
      style={inlineStyles}
      onClick={handleClick}
      {...inputProps}
    >
      {isSelfClosing ? null : (
        <>
          {renderTextContent()}
          {renderFormControl()}
          {renderListItems()}
          {renderTable()}
          {renderSwitch()}
          {!isFormControl && component.type !== "list" && component.type !== "table" && component.type !== "switch" && childElements}
        </>
      )}
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
      onDoubleClick={handleDoubleClick}
    >
      {element}
    </EditWrapper>
  );
};

export const Renderer = React.memo(RendererInner);
