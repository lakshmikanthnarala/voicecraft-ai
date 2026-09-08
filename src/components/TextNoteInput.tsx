import React, { useRef, useState } from 'react';
import { FileText, Sparkles, Upload } from 'lucide-react';

interface TextNoteInputProps {
  onSourceReady: (title: string, text: string) => void;
}

export const TextNoteInput: React.FC<TextNoteInputProps> = ({ onSourceReady }) => {
  const [topic, setTopic] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateFromTopic = () => {
    const value = topic.trim();
    if (!value) return;

    onSourceReady(value.slice(0, 70), `Create structured notes about: ${value}`);
    setTopic('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    if (!text.trim()) return;

    setFileName(file.name);
    onSourceReady(file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Notes', text);
    event.target.value = '';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
        <FileText className="w-5 h-5 text-cyan-400" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Start with a topic or notes</h2>
      </div>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Enter anything you want to learn or upload a text/Markdown note to transform it.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleCreateFromTopic();
          }}
          placeholder="e.g. Explain photosynthesis for a beginner"
          aria-label="Topic to turn into notes"
          style={{
            flex: '1 1 280px',
            minWidth: 0,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
        <button type="button" onClick={handleCreateFromTopic} disabled={!topic.trim()} className="btn btn-primary">
          <Sparkles className="w-4 h-4" />
          <span>Use Topic</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <span style={{ height: '1px', flex: 1, background: 'var(--bg-card-border)' }} />
        <span>OR UPLOAD NOTES</span>
        <span style={{ height: '1px', flex: 1, background: 'var(--bg-card-border)' }} />
      </div>

      <label className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
        <Upload className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fileName || 'Upload a notes file'}</div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Plain text or Markdown (.txt, .md)</div>
        </div>
        <input ref={fileInputRef} type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleFileUpload} style={{ display: 'none' }} />
      </label>
    </div>
  );
};