import React, { useMemo, useState, useEffect } from 'react';
import { Clock, HardDrive, AlertTriangle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  lastSaved: number | null;
  isEnabled: boolean;
  hasChanges: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSaved,
  isEnabled,
  hasChanges,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const statusText = useMemo(() => {
    if (!isEnabled) {
      return 'Auto-save disabled';
    }

    if (!lastSaved) {
      return 'Never saved';
    }

    const diffMs = now - lastSaved;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffMinutes > 0) {
      return `Saved ${diffMinutes}m ago`;
    } else if (diffSeconds > 30) {
      return `Saved ${diffSeconds}s ago`;
    } else {
      return 'Saved just now';
    }
  }, [lastSaved, isEnabled, now]);

  const getStatusColor = () => {
    if (!isEnabled) return 'text-slate-500';
    if (hasChanges) return 'text-orange-400';
    return 'text-green-400';
  };

  const getIcon = () => {
    if (!isEnabled) return <AlertTriangle size={14} />;
    if (hasChanges) return <Clock size={14} />;
    return <HardDrive size={14} />;
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${getStatusColor()} bg-slate-800/50`}
      title={isEnabled ? 'Auto-save status' : 'Auto-save is disabled'}
    >
      {getIcon()}
      <span className="hidden sm:inline">{statusText}</span>
    </div>
  );
};