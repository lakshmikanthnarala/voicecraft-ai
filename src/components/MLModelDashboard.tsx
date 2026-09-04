import React, { useState, useEffect } from 'react';
import { X, Cpu, Activity, Download, Zap, Database, CheckCircle2, Layers, HardDrive } from 'lucide-react';
import { mlModelEngine, MLModelMetrics } from '../services/mlModelService';

interface MLModelDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MLModelDashboard: React.FC<MLModelDashboardProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<MLModelMetrics>(mlModelEngine.metrics);
  const [loadingSpeech, setLoadingSpeech] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const unsubscribe = mlModelEngine.subscribe((newMetrics) => {
      setMetrics({ ...newMetrics });
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handlePreloadSpeech = async () => {
    setLoadingSpeech(true);
    await mlModelEngine.loadSpeechMLModel();
    setLoadingSpeech(false);
  };

  const handlePreloadSummary = async () => {
    setLoadingSummary(true);
    await mlModelEngine.loadSummarizerMLModel();
    setLoadingSummary(false);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ML Model Diagnostics & Tensor Inspector</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ONNX WebAssembly / WebGPU Neural Network Runtime</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Summary Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>RUNTIME ENGINE</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{metrics.backend}</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUANTIZATION</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{metrics.quantization}</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAST INFERENCE</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
              <Activity className="w-4 h-4 text-rose-400" />
              <span>{metrics.lastInferenceTimeMs > 0 ? `${metrics.lastInferenceTimeMs} ms` : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* Neural Models Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Model 1: Speech Recognition Whisper */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{metrics.speechModelName}</h3>
              </div>
              <span className="badge badge-indigo">{metrics.speechModelStatus}</span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Automatic Speech Recognition Transformer. Converts audio Mel-spectrogram tensor <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{metrics.tensorShapeAudio}</code> to token sequences.
            </p>
            <button
              onClick={handlePreloadSpeech}
              disabled={loadingSpeech || metrics.speechModelStatus === 'ready'}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.775rem' }}
            >
              {metrics.speechModelStatus === 'ready' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-indigo-400" />}
              <span>{metrics.speechModelStatus === 'ready' ? 'ML Model Loaded in Memory' : 'Preload Whisper Model Weights (39MB)'}</span>
            </button>
          </div>

          {/* Model 2: Summarizer Seq2Seq DistilBART */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive className="w-5 h-5 text-purple-400" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{metrics.summaryModelName}</h3>
              </div>
              <span className="badge badge-emerald">{metrics.summaryModelStatus}</span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Sequence-to-Sequence Neural Summarizer. Encodes text tokens <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{metrics.tensorShapeText}</code> to synthesize executive briefs and action items.
            </p>
            <button
              onClick={handlePreloadSummary}
              disabled={loadingSummary || metrics.summaryModelStatus === 'ready'}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.775rem' }}
            >
              {metrics.summaryModelStatus === 'ready' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-purple-400" />}
              <span>{metrics.summaryModelStatus === 'ready' ? 'ML Model Loaded in Memory' : 'Preload DistilBART Weights (62MB)'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          ✨ All Machine Learning models run 100% locally in your browser memory via WebAssembly ONNX inference. Zero external server uploads required.
        </div>
      </div>
    </div>
  );
};
