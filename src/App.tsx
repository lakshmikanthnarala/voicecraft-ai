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
import { SAMPLE_RECORDINGS } from './services/speechService';
import { generateCustomNote } from './services/aiNoteService';
import { mlModelEngine } from './services/mlModelService';
import { 
  getRecordingsFromStorage, saveRecordingsToStorage, 
  getNotesFromStorage, saveNotesToStorage, 
  getThemeMode, saveThemeMode, 
  getApiKey, saveApiKey, getApiEndpoint, saveApiEndpoint, getApiModel, saveApiModel
} from './services/storageService';

export function App() {
  const [theme, setTheme] = useState<ThemeMode>('cyber-dark');
  const [activeRecording, setActiveRecording] = useState<AudioRecording | null>(null);
  const [activeNote, setActiveNote] = useState<CustomNote | null>(null);
  const [savedNotes, setSavedNotes] = useState<CustomNote[]>([]);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSavedNotesModalOpen, setIsSavedNotesModalOpen] = useState(false);
  const [isMLModalOpen, setIsMLModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiModel, setApiModel] = useState('');

  // Initial setup: Load theme, storage notes, and load default sample recording
  useEffect(() => {
    const savedTheme = getThemeMode();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const notesFromStorage = getNotesFromStorage();
    setSavedNotes(notesFromStorage);

    setApiKey(getApiKey());
    setApiEndpoint(getApiEndpoint());
    setApiModel(getApiModel());

    // Auto load first sample recording so user sees content immediately
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

  const handleRecordingComplete = async (recording: AudioRecording) => {
    setActiveRecording(recording);
    setActiveNote(null);
    // Run ML Speech Model inference call
    try {
      await mlModelEngine.transcribeAudioML(recording.audioUrl || recording.transcript);
    } catch (e) {}
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
  };

  const handleUpdateTranscript = (newTranscript: string) => {
    if (!activeRecording) return;
    setActiveRecording({
      ...activeRecording,
      transcript: newTranscript
    });
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

      // Save to saved notes list
      const updatedList = [generatedNote, ...savedNotes.filter(n => n.id !== generatedNote.id)];
      setSavedNotes(updatedList);
      saveNotesToStorage(updatedList);

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
          />
          <TranscriptViewer
            recording={activeRecording}
            onUpdateTranscript={handleUpdateTranscript}
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
