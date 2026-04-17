import React, { useState, useCallback } from "react";

interface CanvasOverlaysProps {
  children: React.ReactNode;
  onMouseMove?: (position: { x: number; y: number }) => void;
}

export const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  children,
  onMouseMove,
}) => {
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const position = { x, y };
      setMousePosition(position);
      onMouseMove?.(position);
    },
    [onMouseMove],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePosition(null);
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Mouse coordinates overlay */}
      {mousePosition && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
          {Math.round(mousePosition.x)}, {Math.round(mousePosition.y)}
        </div>
      )}
    </div>
  );
};
