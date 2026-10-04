import { Camera, CameraOff, ScanLine, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import ResultDrawer from '../components/ResultDrawer';
import ScanFrame from '../components/ScanFrame';
import { AnalysisResult, analyzeImage } from '../lib/api';

export default function Scanner() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // ─── File upload ───────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g)$/.test(f.type)) {
      setError('Only PNG or JPEG images are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    stopCamera();
    setError(null);
    setResult(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    e.target.value = '';
  }

  // ─── Camera helpers ────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  async function handleToggleCamera() {
    if (cameraActive) {
      stopCamera();
      return;
    }

    setError(null);
    setResult(null);
    setFile(null);
    setPreviewUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);

      // Assign stream to video element once it mounts (next tick)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera permission in your browser and try again.');
      } else if (err?.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(err?.message ?? 'Could not open camera.');
      }
    }
  }

  // ─── Capture frame from live video ────────────────────────────────────────
  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Failed to capture frame from camera.');
          return;
        }
        const captured = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        setFile(captured);
        setPreviewUrl(URL.createObjectURL(captured));
        setError(null);
        setResult(null);
      },
      'image/jpeg',
      0.92,
    );
  }

  // ─── Analyze ──────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!file) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await analyzeImage(file);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Analysis failed. Is the backend running on :3000?');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ─── Reset ────────────────────────────────────────────────────────────────
  function handleReset() {
    stopCamera();
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <>
      <PageHeader
        title="Live Model Prediction"
        subtitle="Capture or upload an image of a plant leaf for instant disease diagnosis."
      />

      <div className="diagnostic-workspace"><section className="scan-workstation"><div className="panel-heading"><span className="technical-label">SPECIMEN / INPUT</span><span className="technical-label">JPG + PNG · MAX 5 MB</span></div>{/* Action buttons */}
      <div className="scan-actions">
        <button
          onClick={() => { stopCamera(); fileRef.current?.click(); }}
          className="primary-button"
        >
          <Upload className="h-4 w-4" strokeWidth={2.2} />
          Upload Image
        </button>

        <button
          onClick={handleToggleCamera}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-transform hover:-translate-y-px active:translate-y-0 ${
            cameraActive
              ? 'bg-bg-elevated border border-accent-coral/60 text-accent-coral'
              : 'border border-line-subtle bg-bg-card text-ink-secondary hover:text-ink-primary'
          }`}
        >
          {cameraActive ? (
            <>
              <CameraOff className="h-4 w-4" strokeWidth={2.2} />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" strokeWidth={2.2} />
              Use Camera
            </>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-5">
        <ScanFrame
          previewUrl={previewUrl}
          isAnalyzing={isAnalyzing}
          cameraActive={cameraActive}
          videoRef={videoRef}
        />
      </div>

      {/* Capture button — shown only while camera is live */}
      {cameraActive && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleCapture}
            className="flex items-center gap-2 rounded-lg bg-accent-coral px-6 py-2.5 text-[13px] font-semibold text-white shadow-glow transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <ScanLine className="h-4 w-4" strokeWidth={2.2} />
            Capture Image
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-accent-coral/40 bg-accent-coral-soft px-4 py-2.5 text-[13px] text-accent-coral">
          {error}
        </div>
      )}

      <div className="scan-bottom-actions">
        <button
          onClick={handleReset}
          disabled={isAnalyzing || (!file && !result && !cameraActive)}
          className="rounded-lg border border-line-subtle bg-bg-card px-5 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          className="primary-button analyze-button"
        >
          {isAnalyzing ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      </section><aside className="scan-guide"><div className="eyebrow">THE FIELD GUIDE</div><h2>A little clarity<br/>goes a long way.</h2><p>A good image helps the model see the details that matter.</p><ol><li><span>01</span><div>One leaf. In focus.<p>Fill the frame with a single leaf, including any visible spots.</p></div></li><li><span>02</span><div>Let the light in.<p>Use even, natural light. Avoid glare and strong shadows.</p></div></li><li><span>03</span><div>Read with context.<p>A model prediction is a starting point, not a substitute for expert advice.</p></div></li></ol><div className="guide-footnote"><span className="signal-dot"/>60% confidence threshold<br/><span>Below that, we ask for a clearer image.</span></div></aside></div><ResultDrawer result={result} onClose={() => setResult(null)} />
    </>
  );
}
