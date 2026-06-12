import React from "react";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", lines = 3 }) => (
  <div className={`space-y-3 p-4 ${className}`}>
    <div className="h-4 bg-[var(--bg-tertiary)] animate-pulse w-3/4 border-2 border-[var(--border)]" />
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-[var(--bg-tertiary)] animate-pulse border-2 border-[var(--border)]"
        style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
      />
    ))}
  </div>
);

export const PanelSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="h-8 bg-[var(--bg-tertiary)] animate-pulse border-2 border-[var(--border)]" />
    <Skeleton lines={6} />
    <div className="h-10 bg-[var(--bg-tertiary)] animate-pulse border-2 border-[var(--border)] mt-4" />
  </div>
);
