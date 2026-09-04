import React, { useState } from 'react';
import { FileText, Sparkles, Search, Copy, Check, Scissors, Volume2, User, Clock } from 'lucide-react';
import { AudioRecording } from '../types';
import { cleanFillerWords, SAMPLE_RECORDINGS } from '../services/speechService';

interface TranscriptViewerProps {
  recording: AudioRecording | null;
  onUpdateTranscript: (newTranscript: string) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  recording,
  onUpdateTranscript
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!recording) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <FileText className="w-12 h-12 text-indigo-400/40" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Active Audio Transcript</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Record your voice or select a sample preset above to view & edit the speech-to-text transcript.
        </p>
      </div>
    );
  }

  const handleCleanFillers = () => {
    const cleaned = cleanFillerWords(recording.transcript);
    onUpdateTranscript(cleaned);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recording.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = recording.transcript.trim() ? recording.transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{recording.title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock className="w-3.5 h-3.5" /> {recording.duration}s</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{recording.date}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCleanFillers}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            title="Remove filler words (um, ah, like, you know)"
          >
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            <span>Clean Fillers</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Audio Playback Controls if URL exists */}
      {recording.audioUrl && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
          <audio src={recording.audioUrl} controls style={{ width: '100%', height: '36px' }} />
        </div>
      )}

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search keywords in transcript..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 1rem 0.5rem 2.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Main Editable Transcript Box */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>SPEECH-TO-TEXT TRANSCRIPT (CLICK TO EDIT)</span>
        </div>
        <textarea
          rows={6}
          value={recording.transcript}
          onChange={(e) => onUpdateTranscript(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Speaker Segment Breakdown if available */}
      {recording.segments && recording.segments.length > 0 && (
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>
            👥 Speaker Segments Breakdown
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recording.segments.map((seg) => (
              <div key={seg.id} className="glass-card" style={{ padding: '0.65rem 0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User className="w-3.5 h-3.5" /> {seg.speaker}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    [{seg.startTime}s - {seg.endTime}s]
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{seg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
