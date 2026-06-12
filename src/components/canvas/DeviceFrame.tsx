import React, { useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'custom';

interface DeviceFrameProps {
  device: DeviceType;
  width: number;
  height: number;
  children: React.ReactNode;
  scale?: number;
}

const FRAME_CONFIG = {
  mobile: {
    bezelRadius: 52,
    screenRadius: 38,
    bezelWidth: 16,
    showNotch: true,
    showButtons: true,
    showHomeIndicator: true,
    showCamera: false,
    showSpeaker: true,
  },
  tablet: {
    bezelRadius: 28,
    screenRadius: 20,
    bezelWidth: 18,
    showNotch: false,
    showButtons: false,
    showHomeIndicator: false,
    showCamera: true,
    showSpeaker: true,
  },
  desktop: {
    bezelRadius: 10,
    screenRadius: 6,
    bezelWidth: 10,
    showNotch: false,
    showButtons: false,
    showHomeIndicator: false,
    showCamera: false,
    showSpeaker: false,
  },
  custom: {
    bezelRadius: 0,
    screenRadius: 0,
    bezelWidth: 0,
    showNotch: false,
    showButtons: false,
    showHomeIndicator: false,
    showCamera: false,
    showSpeaker: false,
  },
};

const SideButtons: React.FC = () => (
  <>
    <div className="absolute -left-[3px] top-32 w-[3px] h-10 bg-gradient-to-r from-slate-600 to-slate-700 opacity-90 z-30 rounded-r-sm" />
    <div className="absolute -left-[3px] top-44 w-[3px] h-14 bg-gradient-to-r from-slate-600 to-slate-700 opacity-90 z-30 rounded-r-sm" />
    <div className="absolute -left-[3px] top-60 w-[3px] h-8 bg-gradient-to-r from-slate-600 to-slate-700 opacity-90 z-30 rounded-r-sm" />
    <div className="absolute -right-[3px] top-36 w-[3px] h-12 bg-gradient-to-l from-slate-600 to-slate-700 opacity-90 z-30 rounded-l-sm" />
    <div className="absolute -right-[3px] top-52 w-[2px] h-4 bg-slate-600 opacity-70 z-30 rounded-l-sm" />
  </>
);

const Notch: React.FC<{ screenWidth: number }> = ({ screenWidth }) => {
  const notchWidth = Math.min(140, screenWidth * 0.3);
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
      <div
        className="bg-black rounded-b-[18px] flex items-center justify-center gap-4 shadow-inner shadow-slate-900/50"
        style={{
          width: `${notchWidth}px`,
          height: '30px',
          borderBottomLeftRadius: '14px',
          borderBottomRightRadius: '14px',
        }}
      >
        <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700/30" />
        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center overflow-hidden border border-slate-800/50">
          <div className="w-3.5 h-3.5 rounded-full bg-violet-500/30" />
        </div>
      </div>
    </div>
  );
};

const HomeIndicator: React.FC = () => (
  <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 z-20">
    <div className="w-[118px] h-[4px] bg-white/15 rounded-full" />
  </div>
);

const CameraDot: React.FC = () => (
  <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-20">
    <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner shadow-black/50" />
  </div>
);

const SpeakerGrille: React.FC = () => (
  <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-20">
    <div className="w-16 h-[3px] bg-slate-700/50 rounded-full" />
  </div>
);

const ScreenGlare: React.FC = () => (
  <div
    className="absolute inset-0 z-[5] pointer-events-none opacity-[0.03]"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, transparent 100%)',
      borderRadius: 'inherit',
    }}
  />
);

const DesktopStand: React.FC = () => (
  <div className="absolute -bottom-[80px] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
    <div className="w-[55%] h-[5px] bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-sm" />
    <div className="w-[65%] h-[28px] bg-gradient-to-b from-slate-700 to-slate-800" />
    <div className="w-[85%] h-[12px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-sm shadow-lg" />
  </div>
);

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, width, height, children, scale }) => {
  const config = FRAME_CONFIG[device];
  const [isHovered, setIsHovered] = useState(false);

  const outerWidth = width + config.bezelWidth * 2;
  const outerHeight = height + config.bezelWidth * 2;

  const bezelGradient = device === 'mobile'
    ? 'radial-gradient(ellipse at 50% 0%, #4a4a52 0%, #2a2a30 100%)'
    : device === 'tablet'
      ? 'linear-gradient(180deg, #4a4a52 0%, #2a2a30 100%)'
      : 'var(--bg-secondary)';

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Desktop stand */}
        {device === 'desktop' && <DesktopStand />}

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
              background: bezelGradient,
              boxShadow: isHovered
                ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`
                : `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)`,
            }}
          >
            {/* Bezel edge highlight */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                borderRadius: config.bezelRadius,
                boxShadow: `inset 0 0 1px 1px rgba(255,255,255,0.08)`,
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
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.7)',
                  borderRadius: config.screenRadius,
                }}
              />

              {/* Screen glare */}
              <ScreenGlare />

              {children}

              {/* Notch */}
              {config.showNotch && <Notch screenWidth={width} />}

              {/* Speaker grille */}
              {config.showSpeaker && !config.showNotch && <SpeakerGrille />}

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
