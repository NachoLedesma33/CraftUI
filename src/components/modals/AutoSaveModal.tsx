import React, { useState } from 'react';
import { X, RotateCcw, Clock, HardDrive, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';

interface AutoSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AutoSaveVersion {
  id: string;
  timestamp: number;
  componentCount: number;
  data: string;
}

export const AutoSaveModal: React.FC<AutoSaveModalProps> = ({ isOpen, onClose }) => {
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  const {
    getAutoSaveVersions,
    restoreAutoSaveVersion,
    clearAutoSaveVersions,
    addToast,
  } = useUIStore();

  const { restoreFromAutoSave } = useEditorStore();

  const versions = getAutoSaveVersions();

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRestore = async (versionId: string) => {
    setRestoringVersion(versionId);
    try {
      const version = restoreAutoSaveVersion(versionId);
      if (!version) {
        addToast('Version not found', 'error');
        return;
      }

      await restoreFromAutoSave(version.data);
      addToast('Project restored from auto-save', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to restore version:', error);
      addToast('Failed to restore version', 'error');
    } finally {
      setRestoringVersion(null);
      setShowConfirmDialog(null);
    }
  };

  const handleClearAll = () => {
    clearAutoSaveVersions();
    addToast('All auto-save versions cleared', 'info');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <HardDrive size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Auto-Save Versions</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {versions.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No Auto-Save Versions</h3>
                <p className="text-sm text-slate-500">
                  Auto-save versions will appear here as you work on your project.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">
                    {versions.length} version{versions.length !== 1 ? 's' : ''} available
                  </p>
                  <button
                    onClick={() => setShowConfirmDialog('clear')}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/20"
                  >
                    Clear All
                  </button>
                </div>

                {versions.map((version: AutoSaveVersion, index: number) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-400">
                          {versions.length - index}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Version {versions.length - index}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatTimestamp(version.timestamp)} • {version.componentCount} components
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowConfirmDialog(version.id)}
                      disabled={restoringVersion === version.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded transition-colors"
                    >
                      {restoringVersion === version.id ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} />
                          Restore
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-slate-700 bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirmDialog(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-yellow-400" />
              <h3 className="text-lg font-medium text-white">Confirm Action</h3>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              {showConfirmDialog === 'clear'
                ? 'Are you sure you want to clear all auto-save versions? This action cannot be undone.'
                : 'Are you sure you want to restore this version? Your current work will be replaced.'
              }
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirmDialog === 'clear') {
                    handleClearAll();
                  } else {
                    handleRestore(showConfirmDialog);
                  }
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                {showConfirmDialog === 'clear' ? 'Clear All' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};