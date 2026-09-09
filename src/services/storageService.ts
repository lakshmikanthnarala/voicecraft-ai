import { AudioRecording, CustomNote, ThemeMode } from '../types';

const STORAGE_KEY_RECORDINGS = 'voicecraft_recordings';
const STORAGE_KEY_NOTES = 'voicecraft_notes';
const STORAGE_KEY_THEME = 'voicecraft_theme';
const STORAGE_KEY_API_KEY = 'voicecraft_api_key';
const STORAGE_KEY_API_ENDPOINT = 'voicecraft_api_endpoint';
const STORAGE_KEY_API_MODEL = 'voicecraft_api_model';
const STORAGE_KEY_SPEECH_LANGUAGE = 'voicecraft_speech_language';

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

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API_KEY, key);
}

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API_KEY)
    || localStorage.getItem('voicecraft_gemini_api_key')
    || '';
}

export function saveApiEndpoint(endpoint: string): void {
  localStorage.setItem(STORAGE_KEY_API_ENDPOINT, endpoint);
}

export function getApiEndpoint(): string {
  return localStorage.getItem(STORAGE_KEY_API_ENDPOINT)
    || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
}

export function saveApiModel(model: string): void {
  localStorage.setItem(STORAGE_KEY_API_MODEL, model);
}

export function getApiModel(): string {
  return localStorage.getItem(STORAGE_KEY_API_MODEL) || 'gemini-1.5-flash';
}

export function saveSpeechLanguage(language: string): void {
  localStorage.setItem(STORAGE_KEY_SPEECH_LANGUAGE, language);
}

export function getSpeechLanguage(): string {
  return localStorage.getItem(STORAGE_KEY_SPEECH_LANGUAGE) || 'en-US';
}
