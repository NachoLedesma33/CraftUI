import React, { useMemo, useState, useEffect } from 'react';
import { Clock, HardDrive, AlertTriangle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  lastSaved: number | null;
  isEnabled: boolean;
  hasChanges: boolean;
  onClick?: () => void;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSaved,
  isEnabled,
  hasChanges,
  onClick,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const statusText = useMemo(() => {
    if (!isEnabled) return 'Off';
    if (!lastSaved) return 'Never';
    const diffMs = now - lastSaved;
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return 'Just now';
    return `${Math.floor(diffSeconds / 60)}m ago`;
  }, [lastSaved, isEnabled, now]);

  const getStatusColor = () => {
    if (!isEnabled) return 'text-black/40';
    if (hasChanges) return 'text-[#ef4444]';
    return 'text-[#3b82f6]';
  };

  const getIcon = () => {
    if (!isEnabled) return <AlertTriangle size={14} />;
    if (hasChanges) return <Clock size={14} className="animate-pulse" />;
    return <HardDrive size={14} />;
  };

  return (
    <button
      onClick={onClick}
      className={`h-10 px-3 brutal-btn flex items-center gap-2 ${getStatusColor()} border-2 border-black`}
      style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: '2px 2px 0 0 #000' }}
      title={isEnabled ? `Last saved: ${statusText}` : 'Auto-save is disabled'}
    >
      {getIcon()}
      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
        {hasChanges ? 'Changes' : 'Synced'}
      </span>
    </button>
  );
};
