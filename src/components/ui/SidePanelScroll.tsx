import React from "react";

interface SidePanelScrollProps {
  children: React.ReactNode;
  className?: string;
  alwaysShowScrollbar?: boolean;
}

/** Scroll area that fills the remaining side-panel space. */
export const SidePanelScroll: React.FC<SidePanelScrollProps> = ({
  children,
  className = "",
  alwaysShowScrollbar = false,
}) => {
  return (
    <div
      className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-12 ${className}`.trim()}
      style={{
        overflowY: alwaysShowScrollbar ? "scroll" : undefined,
        scrollbarGutter: "stable",
      }}
    >
      {children}
    </div>
  );
};
