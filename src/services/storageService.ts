import { AudioRecording, CustomNote, ThemeMode } from '../types';

const STORAGE_KEY_RECORDINGS = 'voicecraft_recordings';
const STORAGE_KEY_NOTES = 'voicecraft_notes';
const STORAGE_KEY_THEME = 'voicecraft_theme';
const STORAGE_KEY_API_KEY = 'voicecraft_gemini_api_key';

export function saveRecordingsToStorage(recordings: AudioRecording[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(recordings));
  } catch (e) {
    console.error('Failed to save recordings to localStorage:', e);
  }
}

export function getRecordingsFromStorage(): AudioRecording[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECORDINGS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveNotesToStorage(notes: CustomNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

export function getNotesFromStorage(): CustomNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveThemeMode(theme: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function getThemeMode(): ThemeMode {
  return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || 'cyber-dark';
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API_KEY, key);
}

export function getGeminiApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}
