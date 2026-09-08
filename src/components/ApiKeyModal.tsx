import React, { useState } from 'react';
import { X, Key, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  apiEndpoint: string;
  apiModel: string;
  onSaveApiConfig: (key: string, endpoint: string, model: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  apiEndpoint,
  apiModel,
  onSaveApiConfig
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputEndpoint, setInputEndpoint] = useState(apiEndpoint);
  const [inputModel, setInputModel] = useState(apiModel);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiConfig(inputKey.trim(), inputEndpoint.trim(), inputModel.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key className="w-6 h-6 text-amber-400" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Provider Setup</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#fcd34d', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Optional LLM Enhancement:</strong> Configure any API key and model endpoint. Gemini and OpenAI-compatible chat completion APIs are supported. Keys are stored strictly locally in your browser.
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            API KEY
          </label>
          <input
            type="password"
            placeholder="Paste your provider API key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            API ENDPOINT
          </label>
          <input value={inputEndpoint} onChange={(e) => setInputEndpoint(e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            MODEL ID
          </label>
          <input value={inputModel} onChange={(e) => setInputModel(e.target.value)} placeholder="gpt-4o-mini" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.75rem' }}
          >
            {saved ? <Check className="w-5 h-5 text-emerald-300" /> : <Sparkles className="w-5 h-5" />}
            <span>{saved ? 'Saved Successfully!' : 'Save API Key'}</span>
          </button>

          {apiKey && (
            <button
              onClick={() => {
                setInputKey('');
                onSaveApiConfig('', inputEndpoint, inputModel);
              }}
              className="btn btn-secondary"
            >
              Clear Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
