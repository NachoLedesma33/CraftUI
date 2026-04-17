import React, { Component, ReactNode } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useUIStore } from "@/store/uiStore";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error for analytics
    console.error("Global Error Boundary caught an error:", error, errorInfo);

    // In production, you could send this to an analytics service
    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics(error, errorInfo);
    }
  }

  handleDownloadBackup = () => {
    try {
      const editorState = useEditorStore.getState();
      const uiState = useUIStore.getState();

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0", // You might want to get this from package.json
        editor: {
          components: editorState.components,
          selectedIds: editorState.selectedIds,
          rootId: editorState.rootId,
          canvasConfig: editorState.canvasConfig,
        },
        ui: {
          view: uiState.view,
          panels: uiState.panels,
          autoSave: uiState.autoSave,
        },
        error: {
          message: this.state.error?.message,
          stack: this.state.error?.stack,
          componentStack: this.state.errorInfo?.componentStack,
        },
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `craftui-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);
    } catch (backupError) {
      console.error("Failed to create backup:", backupError);
      alert("Failed to create backup. Please check the console for details.");
    }
  };

  handleResetEditor = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the editor? This will clear all your work.",
      )
    ) {
      try {
        // Clear localStorage
        localStorage.removeItem("editor-storage");
        localStorage.removeItem("ui-storage");
        localStorage.removeItem("editor-theme");

        // Reset stores
        useEditorStore.getState().loadState({});
        useEditorStore.getState().setRootId("");
        useUIStore.getState().clearToasts();

        // Reload the page
        window.location.reload();
      } catch (resetError) {
        console.error("Failed to reset editor:", resetError);
        alert(
          "Failed to reset editor. Please manually clear your browser data.",
        );
      }
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500 rounded-lg p-8 max-w-2xl w-full text-center">
            <div className="text-red-400 text-6xl mb-6">⚠️</div>
            <h1 className="text-white text-2xl font-bold mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-400 text-lg mb-6">
              The editor encountered a critical error. Don't worry, your work
              might still be recoverable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={this.handleDownloadBackup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📥 Download Backup
              </button>
              <button
                onClick={this.handleResetEditor}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Reset Editor
              </button>
              <button
                onClick={this.handleReload}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ↻ Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-slate-900 p-4 rounded-lg border border-slate-700">
                <summary className="text-slate-400 cursor-pointer font-medium mb-2">
                  Error Details (Development Mode)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-red-400 font-medium mb-1">
                      Error Message:
                    </h4>
                    <pre className="text-red-300 text-sm overflow-auto bg-slate-950 p-2 rounded">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">
                        Stack Trace:
                      </h4>
                      <pre className="text-red-300 text-xs overflow-auto bg-slate-950 p-2 rounded max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">
                        Component Stack:
                      </h4>
                      <pre className="text-red-300 text-xs overflow-auto bg-slate-950 p-2 rounded max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <p className="text-slate-500 text-sm mt-6">
              If this problem persists, please report it with the backup file.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
