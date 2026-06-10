import React, { useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceFrameProps {
  device: DeviceType;
  width: number;
  height: number;
  children: React.ReactNode;
  scale?: number;
}

const FRAME_CONFIG = {
  mobile: {
    bezelRadius: 48,
    screenRadius: 36,
    bezelWidth: 14,
    showNotch: true,
    showButtons: true,
    showHomeIndicator: true,
    showCamera: false,
  },
  tablet: {
    bezelRadius: 24,
    screenRadius: 18,
    bezelWidth: 16,
    showNotch: false,
    showButtons: false,
    showHomeIndicator: false,
    showCamera: true,
  },
  desktop: {
    bezelRadius: 8,
    screenRadius: 4,
    bezelWidth: 8,
    showNotch: false,
    showButtons: false,
    showHomeIndicator: false,
    showCamera: false,
  },
};

const SideButtons: React.FC = () => (
  <>
    <div className="absolute -left-[3px] top-32 w-[3px] h-10 bg-[var(--bg-tertiary)] opacity-80 z-30" />
    <div className="absolute -left-[3px] top-44 w-[3px] h-14 bg-[var(--bg-tertiary)] opacity-80 z-30" />
    <div className="absolute -left-[3px] top-60 w-[3px] h-8 bg-[var(--bg-tertiary)] opacity-80 z-30" />
    <div className="absolute -right-[3px] top-36 w-[3px] h-12 bg-[var(--bg-tertiary)] opacity-80 z-30" />
  </>
);

const Notch: React.FC = () => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
    <div className="h-[28px] w-[110px] bg-black rounded-[18px] flex items-center justify-center gap-4 shadow-inner shadow-slate-900/50">
      <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700/30" />
      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center overflow-hidden border border-slate-800/50">
        <div className="w-3.5 h-3.5 rounded-full bg-violet-500/20" />
      </div>
    </div>
  </div>
);

const HomeIndicator: React.FC = () => (
  <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 z-20">
    <div className="w-[118px] h-[4px] bg-white/20 rounded-full" />
  </div>
);

const CameraDot: React.FC = () => (
  <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-20">
    <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner shadow-black/50" />
  </div>
);

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, width, height, children, scale }) => {
  const config = FRAME_CONFIG[device];
  const [isHovered, setIsHovered] = useState(false);

  const outerWidth = width + config.bezelWidth * 2;
  const outerHeight = height + config.bezelWidth * 2;

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Desktop stand */}
        {device === 'desktop' && (
          <div className="absolute -bottom-[72px] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
            <div className="w-[55%] h-[14px] bg-[var(--bg-tertiary)]" />
            <div className="w-[65%] h-[30px] bg-[var(--bg-tertiary)]" />
            <div className="w-[85%] h-[10px] bg-[var(--bg-tertiary)]" />
          </div>
        )}

        {/* 3D transform wrapper */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            transform: `scale(${scale ?? 1}) ${isHovered ? 'rotateX(3deg)' : 'rotateX(0deg)'}`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Bezel body */}
          <div
            className="relative transition-all duration-500 ease-out"
            style={{
              width: outerWidth,
              height: outerHeight,
              borderRadius: config.bezelRadius,
              padding: config.bezelWidth,
              background: 'var(--bg-secondary)',
            }}
          >
            {/* Bezel edge highlight */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                borderRadius: config.bezelRadius,
              }}
            />

            {/* Side buttons */}
            {config.showButtons && <SideButtons />}

            {/* Screen */}
            <div
              className="relative w-full h-full overflow-hidden bg-black"
              style={{ borderRadius: config.screenRadius }}
            >
              {/* Screen inner shadow */}
              <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
                style={{
                  boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)',
                  borderRadius: config.screenRadius,
                }}
              />

              {children}

              {/* Notch */}
              {config.showNotch && <Notch />}

              {/* Home indicator */}
              {config.showHomeIndicator && <HomeIndicator />}

              {/* Camera dot */}
              {config.showCamera && <CameraDot />}
            </div>
          </div>
        </div>
      </div>

      {/* Dimension label */}
      <div
        className="transition-all duration-300"
        style={{ opacity: isHovered ? 1 : 0.4 }}
      >
        <span className="text-xs text-[var(--text-muted)] font-mono tracking-wide">
          {width} &times; {height} px
        </span>
      </div>
    </div>
  );
};
