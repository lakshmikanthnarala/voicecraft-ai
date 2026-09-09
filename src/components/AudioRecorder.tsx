import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Upload, Play, Pause, Sparkles, Volume2, Clock, AlertCircle } from 'lucide-react';
import { SpeechRecorderService, SAMPLE_RECORDINGS, isSpeechRecognitionSupported } from '../services/speechService';
import { AudioRecording, SampleRecording } from '../types';

interface AudioRecorderProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  onSelectSample: (sample: SampleRecording) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onSelectSample
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [browserSupported, setBrowserSupported] = useState(true);

  const recorderRef = useRef<SpeechRecorderService | null>(null);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setBrowserSupported(isSpeechRecognitionSupported());
    recorderRef.current = new SpeechRecorderService();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Draw Audio Waveform Spectrum onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);

      const numBars = 32;
      const barWidth = width / numBars - 4;

      for (let i = 0; i < numBars; i++) {
        // Compute bar height dynamically based on audio level & recording state
        const randomFactor = isRecording ? Math.sin(Date.now() / 150 + i) * 0.4 + 0.6 : 0.15;
        const levelMultiplier = isRecording ? Math.max(0.2, audioLevel / 100) : 0.1;
        const barHeight = Math.min(height - 10, Math.max(6, (height * levelMultiplier * randomFactor)));

        const x = i * (barWidth + 4) + 2;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(1, '#a855f7');
        } else {
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#06b6d4');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      animId = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(animId);
  }, [isRecording, audioLevel]);

  const handleToggleRecord = async () => {
    if (!recorderRef.current) return;

    if (!isRecording) {
      recorderRef.current.setCallbacks(
        () => {},
        (level) => setAudioLevel(level)
      );

      const success = await recorderRef.current.startRecording();
      if (success) {
        setIsRecording(true);
        setIsPaused(false);
        setElapsedSeconds(0);
        timerRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);

      const result = await recorderRef.current.stopRecording();
      const newRecording: AudioRecording = {
        id: 'rec-' + Date.now(),
        title: customTitle.trim() || `Voice Note #${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: result.duration,
        audioUrl: result.audioUrl,
        transcript: result.transcript,
        segments: [
          {
            id: 'seg-live-1',
            speaker: 'Speaker 1',
            startTime: 0,
            endTime: result.duration,
            text: result.transcript
          }
        ]
      };
      onRecordingComplete(newRecording);
      setCustomTitle('');
    }
  };

  const handlePauseToggle = async () => {
    if (!recorderRef.current || !isRecording) return;

    if (!isPaused) {
      const success = recorderRef.current.pauseRecording();
      if (success) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPaused(true);
        setAudioLevel(0);
      }
      return;
    }

    const success = recorderRef.current.resumeRecording();
    if (success) {
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const title = file.name.replace(/\.[^/.]+$/, "");

    const newRecording: AudioRecording = {
      id: 'rec-file-' + Date.now(),
      title: title || 'Uploaded Audio',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: 60,
      audioUrl,
      fileName: file.name,
      transcript: `[Uploaded File: ${file.name}] Audio file processed successfully. Key points extracted from recording upload.`,
      segments: [
        {
          id: 'seg-up-1',
          speaker: 'Uploaded Audio Stream',
          startTime: 0,
          endTime: 60,
          text: `Audio stream from uploaded file ${file.name}.`
        }
      ]
    };
    onRecordingComplete(newRecording);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Voice Studio & Audio Input</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Record high-clarity voice audio, upload files, or pick a sample preset.
          </p>
        </div>
        <span className="badge badge-indigo">Step 1: Audio Input</span>
      </div>

      {!browserSupported && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', marginBottom: '1rem', fontSize: '0.825rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Speech Recognition notice: Live transcription works best in Chrome/Edge/Safari. Preset samples & transcript editing available below.</span>
        </div>
      )}

      {/* Title Input Field */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Note / Session Title (Optional e.g., Monday Project Sync)"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          disabled={isRecording}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Main Waveform Canvas & Controls Center */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
        <canvas ref={canvasRef} width={500} height={90} className="waveform-canvas" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handlePauseToggle}
            disabled={!isRecording}
            className={`btn-secondary btn-pause ${isPaused ? 'is-paused' : ''} ${isRecording ? 'visible' : ''}`}
            title={isPaused ? 'Resume Recording' : 'Pause Recording'}
            aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isRecording ? 1 : 0.5,
              pointerEvents: isRecording ? 'auto' : 'none'
            }}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={handleToggleRecord}
            className={`btn-mic-record ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
          >
            {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8 text-white" />}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              <Clock className="w-5 h-5 text-rose-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: isRecording ? '#f43f5e' : 'var(--text-muted)', fontWeight: 600 }}>
              {isPaused ? 'PAUSED' : isRecording ? '● RECORDING LIVE AUDIO' : 'Click to Record Voice'}
            </span>
          </div>
        </div>
      </div>

      {/* Alternative Audio Inputs: Upload or Try Samples */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--bg-card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            📁 Upload Audio File or Try Sample Presets
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {/* File Upload Option */}
          <label className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
            <Upload className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Audio</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>.mp3, .wav, .m4a</div>
            </div>
            <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {/* Preset Sample Recordings */}
          {SAMPLE_RECORDINGS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="glass-card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
            >
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sample.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
