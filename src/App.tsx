import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { AudioRecorder } from './components/AudioRecorder';
import { TextNoteInput } from './components/TextNoteInput';
import { TranscriptViewer } from './components/TranscriptViewer';
import { NoteGenerator } from './components/NoteGenerator';
import { NoteEditor } from './components/NoteEditor';
import { SavedNotesModal } from './components/SavedNotesModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MLModelDashboard } from './components/MLModelDashboard';

import { AudioRecording, CustomNote, NoteTemplateId, SampleRecording, ThemeMode } from './types';
import { SAMPLE_RECORDINGS, isTranscriptLikelyLowQuality } from './services/speechService';
import { generateCustomNote } from './services/aiNoteService';
import { mlModelEngine } from './services/mlModelService';
import { 
  getRecordingsFromStorage, saveRecordingsToStorage, 
  getNotesFromStorage, saveNotesToStorage, 
  getThemeMode, saveThemeMode, 
  getApiKey, saveApiKey, getApiEndpoint, saveApiEndpoint, getApiModel, saveApiModel,
  getSpeechLanguage, saveSpeechLanguage
} from './services/storageService';

export function App() {
  const [theme, setTheme] = useState<ThemeMode>('cyber-dark');
  const [activeRecording, setActiveRecording] = useState<AudioRecording | null>(null);
  const [activeNote, setActiveNote] = useState<CustomNote | null>(null);
  const [savedNotes, setSavedNotes] = useState<CustomNote[]>([]);
  const [savedRecordings, setSavedRecordings] = useState<AudioRecording[]>([]);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSavedNotesModalOpen, setIsSavedNotesModalOpen] = useState(false);
  const [isMLModalOpen, setIsMLModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState(getSpeechLanguage());

  // Initial setup: Load theme, storage notes, and load default sample recording
  useEffect(() => {
    const savedTheme = getThemeMode();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const notesFromStorage = getNotesFromStorage();
    setSavedNotes(notesFromStorage);

    const storedRecordings = getRecordingsFromStorage();
    setSavedRecordings(storedRecordings);

    const savedApiKey = getApiKey();
    const savedApiEndpoint = getApiEndpoint();
    const savedApiModel = getApiModel();

    const savedSpeechLanguage = getSpeechLanguage();
    setApiKey(savedApiKey);
    setApiEndpoint(savedApiEndpoint);
    setApiModel(savedApiModel);
    setSpeechLanguage(savedSpeechLanguage);
    mlModelEngine.configureAudio(savedApiKey, savedApiModel, savedApiEndpoint, savedSpeechLanguage);

    if (storedRecordings.length > 0) {
      setActiveRecording(storedRecordings[0]);
      return;
    }

    if (SAMPLE_RECORDINGS.length > 0) {
      const defaultSample = SAMPLE_RECORDINGS[0];
      const rec: AudioRecording = {
        id: defaultSample.id,
        title: defaultSample.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: defaultSample.duration,
        transcript: defaultSample.transcript,
        segments: defaultSample.segments
      };
      setActiveRecording(rec);
    }
  }, []);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveThemeMode(newTheme);
  };

  const handleSpeechLanguageChange = (language: string) => {
    const normalizedLanguage = language || 'en-US';
    setSpeechLanguage(normalizedLanguage);
    saveSpeechLanguage(normalizedLanguage);
    mlModelEngine.configureAudio(apiKey, apiModel, apiEndpoint, normalizedLanguage);
  };

  const persistRecording = (recording: AudioRecording) => {
    const updatedList = [recording, ...savedRecordings.filter(r => r.id !== recording.id)];
    setSavedRecordings(updatedList);
    saveRecordingsToStorage(updatedList);
  };

  const handleRecordingComplete = async (recording: AudioRecording) => {
    setActiveRecording(recording);
    setActiveNote(null);
    persistRecording(recording);

    const existingTranscript = recording.transcript?.trim() || '';
    const looksLikePlaceholderTranscript = /Audio recorded successfully|No spoken speech detected|ML Whisper Model|Speech processing complete/i.test(existingTranscript);

    try {
      if (!recording.audioUrl || !recording.audioUrl.trim()) {
        return;
      }

      const previewTranscript = existingTranscript && !looksLikePlaceholderTranscript ? existingTranscript : '';
      const whisperTranscript = await transcribeAudioRecording(recording.audioUrl, recording.duration);
      const cleanedWhisper = whisperTranscript.trim();
      if (!cleanedWhisper || /ML Whisper Model|Speech processing complete|transcription completed/i.test(cleanedWhisper)) {
        if (previewTranscript) {
          const updatedRecording: AudioRecording = {
            ...recording,
            transcript: previewTranscript,
            segments: [{
              id: `seg-${Date.now()}`,
              speaker: 'Live Transcript',
              startTime: 0,
              endTime: recording.duration,
              text: previewTranscript
            }]
          };
          setActiveRecording(updatedRecording);
          persistRecording(updatedRecording);
        }
        return;
      }

      const finalTranscript = (() => {
        if (!previewTranscript) {
          return cleanedWhisper;
        }

        const previewQuality = isTranscriptLikelyLowQuality(previewTranscript, recording.duration) ? 0 : 1;
        const whisperQuality = isTranscriptLikelyLowQuality(cleanedWhisper, recording.duration) ? 0 : 1;

        if (previewQuality === whisperQuality) {
          return cleanedWhisper.length >= previewTranscript.length ? cleanedWhisper : previewTranscript;
        }

        return whisperQuality > previewQuality ? cleanedWhisper : previewTranscript;
      })();

      const updatedRecording: AudioRecording = {
        ...recording,
        transcript: finalTranscript,
        segments: [
          {
            id: `seg-${Date.now()}`,
            speaker: finalTranscript === cleanedWhisper ? 'Auto Transcript' : 'Live Transcript',
            startTime: 0,
            endTime: recording.duration,
            text: finalTranscript
          }
        ]
      };

      setActiveRecording(updatedRecording);
      persistRecording(updatedRecording);
    } catch (e) {
      console.error('Audio transcription failed:', e);
    }
  };

  const handleSelectSample = (sample: SampleRecording) => {
    const rec: AudioRecording = {
      id: sample.id,
      title: sample.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: sample.duration,
      transcript: sample.transcript,
      segments: sample.segments
    };
    setActiveRecording(rec);
    setActiveNote(null);
    persistRecording(rec);
  };

  const handleUpdateTranscript = (newTranscript: string) => {
    if (!activeRecording) return;
    const updatedRecording = {
      ...activeRecording,
      transcript: newTranscript,
      segments: activeRecording.segments.length > 0
        ? activeRecording.segments.map((segment, i) => i === 0 ? { ...segment, text: newTranscript } : segment)
        : [{
            id: 'seg-updated-1',
            speaker: 'Edited Transcript',
            startTime: 0,
            endTime: activeRecording.duration,
            text: newTranscript
          }]
    };
    setActiveRecording(updatedRecording);
    persistRecording(updatedRecording);
  };

  const handleTextSourceReady = (title: string, text: string) => {
    const recording: AudioRecording = {
      id: 'rec-text-' + Date.now(),
      title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: 0,
      transcript: text,
      segments: [{
        id: 'seg-text-1',
        speaker: 'Written Source',
        startTime: 0,
        endTime: 0,
        text
      }]
    };
    setActiveRecording(recording);
    setActiveNote(null);
    persistRecording(recording);
  };

  const transcribeAudioRecording = async (audioUrl: string | undefined, durationSeconds: number): Promise<string> => {
    if (!audioUrl || !audioUrl.trim()) return '';

    const firstPass = await mlModelEngine.transcribeAudioML(audioUrl, apiKey, apiModel, speechLanguage);
    const cleanedFirstPass = firstPass.trim();
    if (!cleanedFirstPass) return '';

    if (!isTranscriptLikelyLowQuality(cleanedFirstPass, durationSeconds)) {
      return cleanedFirstPass;
    }

    const secondPass = await mlModelEngine.transcribeAudioML(audioUrl, apiKey, apiModel, speechLanguage);
    const cleanedSecondPass = secondPass.trim();
    if (cleanedSecondPass && !isTranscriptLikelyLowQuality(cleanedSecondPass, durationSeconds)) {
      return cleanedSecondPass;
    }

    return cleanedFirstPass;
  };

  const handleRetryTranscription = async () => {
    if (!activeRecording || !activeRecording.audioUrl) return;

    const transcribedText = await transcribeAudioRecording(activeRecording.audioUrl, activeRecording.duration);
    if (!transcribedText) return;

    const updatedRecording: AudioRecording = {
      ...activeRecording,
      transcript: transcribedText,
      segments: [{
        id: `seg-retry-${Date.now()}`,
        speaker: 'Auto Transcript',
        startTime: 0,
        endTime: activeRecording.duration,
        text: transcribedText
      }]
    };

    setActiveRecording(updatedRecording);
    persistRecording(updatedRecording);
  };

  const handleGenerateNote = async (templateId: NoteTemplateId, customPrompt?: string) => {
    if (!activeRecording || !activeRecording.transcript.trim()) return;

    setIsGeneratingNote(true);

    try {
      // Trigger ML Summarizer Inference metric pass
      await mlModelEngine.summarizeTextML(activeRecording.transcript);

      const generatedNote = await generateCustomNote(
        activeRecording.id,
        activeRecording.title,
        activeRecording.transcript,
        templateId,
        customPrompt,
        apiKey,
        apiEndpoint,
        apiModel
      );

      setActiveNote(generatedNote);

      // Save to saved notes list using the latest state so rapid generation does not drop or duplicate notes.
      setSavedNotes(prevNotes => {
        const updatedList = [generatedNote, ...prevNotes.filter(n => n.id !== generatedNote.id)];
        saveNotesToStorage(updatedList);
        return updatedList;
      });

      // Trigger Confetti Celebration
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.error('Note generation failed:', e);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleSaveNote = (updatedNote: CustomNote) => {
    setActiveNote(updatedNote);
    const updatedList = savedNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setSavedNotes(updatedList);
    saveNotesToStorage(updatedList);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = savedNotes.filter(n => n.id !== noteId);
    setSavedNotes(updated);
    saveNotesToStorage(updated);
    if (activeNote?.id === noteId) {
      setActiveNote(null);
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenSavedNotesModal={() => setIsSavedNotesModalOpen(true)}
        onOpenMLModal={() => setIsMLModalOpen(true)}
        savedNotesCount={savedNotes.length}
      />

      {/* Main Studio Grid: Audio Input & Transcript on Left, Note Customizer & Note Editor on Right */}
      <main className="studio-grid">
        {/* Left Column: Audio Recording & Speech-to-Text Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TextNoteInput onSourceReady={handleTextSourceReady} />
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onSelectSample={handleSelectSample}
            speechLanguage={speechLanguage}
            onSpeechLanguageChange={handleSpeechLanguageChange}
          />
          <TranscriptViewer
            recording={activeRecording}
            onUpdateTranscript={handleUpdateTranscript}
            onRetryTranscription={handleRetryTranscription}
          />
        </div>

        {/* Right Column: Note Generator Customizer & Note Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <NoteGenerator
            onGenerate={handleGenerateNote}
            isGenerating={isGeneratingNote}
            disabled={!activeRecording || !activeRecording.transcript.trim()}
          />
          <NoteEditor
            note={activeNote}
            onSaveNote={handleSaveNote}
          />
        </div>
      </main>

      {/* Modals */}
      <SavedNotesModal
        isOpen={isSavedNotesModalOpen}
        onClose={() => setIsSavedNotesModalOpen(false)}
        notes={savedNotes}
        onSelectNote={(note) => setActiveNote(note)}
        onDeleteNote={handleDeleteNote}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        apiEndpoint={apiEndpoint}
        apiModel={apiModel}
        onSaveApiConfig={(key, endpoint, model) => {
          setApiKey(key);
          setApiEndpoint(endpoint);
          setApiModel(model);
          saveApiKey(key);
          saveApiEndpoint(endpoint);
          saveApiModel(model);
          mlModelEngine.configureAudio(key, model, endpoint);
        }}
      />

      <MLModelDashboard
        isOpen={isMLModalOpen}
        onClose={() => setIsMLModalOpen(false)}
      />
    </div>
  );
}

export default App;
