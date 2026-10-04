import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Sprout, X } from 'lucide-react';
import { AnalysisResult, confidenceToNumber } from '../lib/api';

type Props = {
  result: AnalysisResult | null;
  onClose: () => void;
};

export default function ResultDrawer({ result, onClose }: Props) {
  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="result-drawer fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl rounded-t-2xl border border-b-0 border-line-strong bg-bg-card p-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" />
            <ResultBody result={result} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ResultBody({ result, onClose }: { result: AnalysisResult; onClose: () => void }) {
  const isUncertain = result.disease.toLowerCase() === 'uncertain';
  const isHealthy = result.disease.toLowerCase() === 'healthy';
  const confidence = confidenceToNumber(result.confidence);

  const accent = isUncertain
    ? 'text-accent-amber'
    : isHealthy
    ? 'text-accent-green'
    : 'text-accent-coral';

  const Icon = isUncertain ? AlertTriangle : isHealthy ? CheckCircle2 : Sprout;

  return (
    <div className="relative">
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-0 top-0 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-bg-elevated hover:text-ink-primary"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-5">
        <ConfidenceRing pct={confidence} variant={isUncertain ? 'amber' : isHealthy ? 'green' : 'coral'} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${accent}`} strokeWidth={2.2} />
            <span className="text-[12px] font-medium uppercase tracking-wider text-ink-secondary">
              {isUncertain ? 'Low confidence' : isHealthy ? 'Healthy' : 'Disease detected'}
            </span>
          </div>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-ink-primary">
            {result.disease}
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-secondary">
            Crop:&nbsp;<span className="text-ink-primary">{result.crop}</span>
          </p>
          <p className="mt-4 max-w-prose text-[13px] leading-relaxed text-ink-secondary">
            {result.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfidenceRing({
  pct,
  variant,
}: {
  pct: number;
  variant: 'coral' | 'green' | 'amber';
}) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  const stroke =
    variant === 'green' ? '#cef79e' : variant === 'amber' ? '#f7f7f5' : '#cef79e';

  return (
    <div className="relative h-[78px] w-[78px] shrink-0">
      <svg viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#4d5757" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-semibold text-ink-primary">{pct.toFixed(1)}%</span>
        <span className="text-[9px] uppercase tracking-wider text-ink-muted">conf</span>
      </div>
    </div>
  );
}
