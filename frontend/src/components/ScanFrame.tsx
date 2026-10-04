import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { RefObject } from 'react';

type Props = {
  previewUrl: string | null;
  isAnalyzing: boolean;
  cameraActive?: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
};

export default function ScanFrame({ previewUrl, isAnalyzing, cameraActive, videoRef }: Props) {
  return (
    <div className="scan-frame relative overflow-hidden">
      {/* Top scan line accent */}
      <div className="hidden" />

      <div className="scan-canvas relative flex items-center justify-center px-6">
        {cameraActive ? (
          /* ── Live camera feed ── */
          <div className="relative h-full w-full flex items-center justify-center">
            <video
              ref={videoRef as RefObject<HTMLVideoElement>}
              autoPlay
              playsInline
              muted
              className="max-h-[320px] max-w-full rounded-lg object-contain shadow-lg"
            />
            {/* Corner brackets to give a "scanner" look */}
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
              <span
                key={i}
                className={`absolute ${pos} h-5 w-5 border-accent-coral opacity-80 ${
                  i < 2 ? 'border-t-2' : 'border-b-2'
                } ${i % 2 === 0 ? 'border-l-2' : 'border-r-2'} rounded-sm`}
              />
            ))}
            {/* Pulsing "LIVE" badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-bg-card/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-coral shadow">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-coral" />
              Live
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="leaf preview"
              className="max-h-[300px] max-w-full rounded-lg object-contain shadow-lg"
            />

            {isAnalyzing && (
              <>
                {/* Sweeping scan line — clipped to the image bounds */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                    className="absolute inset-x-0 h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-accent-coral to-transparent"

                  />
                </div>
                {/* "ANALYZING…" pill overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-md bg-accent-coral/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-glow">
                    Analyzing…
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-muted">
            <div className="specimen-mark"><svg viewBox="0 0 200 200" fill="none" aria-hidden="true"><path d="M43 160C31 83 71 31 158 27C174 102 135 159 43 160Z" stroke="currentColor" strokeWidth="1"/><path d="M36 174L146 42M58 149L60 96M78 127L118 132M95 107L96 65M114 83L147 87" stroke="currentColor" strokeWidth="1"/></svg><ImageIcon size={20} strokeWidth={1}/></div>
            <p className="text-[13px]">Your next discovery starts with a leaf.</p>
          </div>
        )}
      </div>

      {/* Bottom rail */}
      <div className="scan-rail"><span className="signal-dot"/><span>{cameraActive ? "CAMERA ACTIVE" : previewUrl ? "SPECIMEN LOADED" : "AWAITING SPECIMEN"}</span><span>224 × 224 / RGB</span></div>
    </div>
  );
}
