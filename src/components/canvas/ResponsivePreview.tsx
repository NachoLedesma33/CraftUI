import React, { useState, useMemo, useCallback } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  X,
  ExternalLink,
} from 'lucide-react';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';
import { exportToHTML } from '@/utils/export/HTMLExporter';

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'custom';
type ZoomLevel = '50' | '75' | '100' | 'fit';

interface DevicePreset {
  id: DeviceType;
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: <Smartphone size={16} /> },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: <Tablet size={16} /> },
  { id: 'desktop', name: 'Desktop', width: 1200, height: 900, icon: <Monitor size={16} /> },
];

const getDeviceDimensions = (device: DeviceType, isLandscape: boolean): { width: number; height: number } => {
  const preset = DEVICE_PRESETS.find((d) => d.id === device);
  const baseWidth = preset?.width ?? 1200;
  const baseHeight = preset?.height ?? 900;
  
  return isLandscape
    ? { width: baseHeight, height: baseWidth }
    : { width: baseWidth, height: baseHeight };
};

interface PreviewToolbarProps {
  activeDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onRotate: () => void;
  isLandscape: boolean;
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  onExit: () => void;
  onOpenInNewTab: () => void;
}

const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  activeDevice,
  onDeviceChange,
  onRotate,
  isLandscape,
  zoom,
  onZoomChange,
  onExit,
  onOpenInNewTab,
}) => {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        {DEVICE_PRESETS.map((device) => (
          <button
            key={device.id}
            onClick={() => onDeviceChange(device.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeDevice === device.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {device.icon}
            {device.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRotate}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          title={isLandscape ? 'Portrait' : 'Landscape'}
        >
          <RotateCw size={16} />
          {isLandscape ? 'Portrait' : 'Landscape'}
        </button>

        <select
          value={zoom}
          onChange={(e) => onZoomChange(e.target.value as ZoomLevel)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="fit">Fit</option>
        </select>

        <div className="h-6 w-px bg-slate-700" />

        <button
          onClick={onOpenInNewTab}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          <ExternalLink size={16} />
          Open in New Tab
        </button>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <X size={16} />
          Exit Preview
        </button>
      </div>
    </div>
  );
};

interface DimensionOverlayProps {
  width: number;
  height: number;
}

const DimensionOverlay: React.FC<DimensionOverlayProps> = ({ width, height }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-xs font-mono rounded-full backdrop-blur-sm">
      {width} × {height} px
    </div>
  );
};

export const ResponsivePreview: React.FC = () => {
  const components = useEditorStore((s) => s.components);
  const rootId = useEditorStore((s) => s.rootId);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);

  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoom, setZoom] = useState<ZoomLevel>('fit');

  const dimensions = useMemo(
    () => getDeviceDimensions(device, isLandscape),
    [device, isLandscape]
  );

  const srcDoc = useMemo(() => {
    if (!rootId || !components[rootId]) return '';
    
    try {
      return exportToHTML(components, rootId, {
        useClasses: false,
        minify: false,
        includeReset: true,
        includeGoogleFonts: true,
        addAriaLabels: true,
        componentName: 'preview',
      });
    } catch (error) {
      console.error('Failed to generate preview HTML:', error);
      return '<html><body><p>Error generating preview</p></body></html>';
    }
  }, [components, rootId]);

  const handleRotate = useCallback(() => {
    setIsLandscape((prev) => !prev);
  }, []);

  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDevice(newDevice);
    setIsLandscape(false);
  }, []);

  const handleExit = useCallback(() => {
    setPreviewMode(false);
  }, [setPreviewMode]);

  const handleOpenInNewTab = useCallback(() => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [srcDoc]);

  const scale = useMemo(() => {
    if (zoom === 'fit') return undefined;
    return parseInt(zoom) / 100;
  }, [zoom]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-hidden">
      <PreviewToolbar
        activeDevice={device}
        onDeviceChange={handleDeviceChange}
        onRotate={handleRotate}
        isLandscape={isLandscape}
        zoom={zoom}
        onZoomChange={setZoom}
        onExit={handleExit}
        onOpenInNewTab={handleOpenInNewTab}
      />

      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className="relative bg-white shadow-2xl rounded-[2rem] border-[12px] border-slate-900 overflow-hidden transition-all duration-300"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: scale ? `scale(${scale})` : undefined,
            transformOrigin: 'center center',
          }}
        >
          <iframe
            title="Preview"
            className="w-full h-full border-none"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin"
          />
          <DimensionOverlay width={dimensions.width} height={dimensions.height} />
        </div>
      </div>
    </div>
  );
};