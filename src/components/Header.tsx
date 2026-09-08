import React from 'react';
import { Mic, Cpu, Key, FolderOpen, Moon, Sun, Flame } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onOpenApiKeyModal: () => void;
  onOpenSavedNotesModal: () => void;
  onOpenMLModal: () => void;
  savedNotesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onSelectTheme,
  onOpenApiKeyModal,
  onOpenSavedNotesModal,
  onOpenMLModal,
  savedNotesCount
}) => {
  return (
    <header className="glass-panel main-header">
      <div className="logo-group">
        <div className="logo-icon-wrapper">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text" style={{ fontSize: '1.4rem' }}>
            VoiceCraft <span style={{ color: 'var(--accent-primary)', fontSize: '0.85em' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
            Voice Recording & Custom Note Studio
          </p>
        </div>
      </div>

      <div className="nav-actions">
        {/* ML Model Inspector Trigger */}
        <button
          onClick={onOpenMLModal}
          className="btn btn-secondary"
          title="Open Machine Learning Model Tensor & Diagnostic Inspector"
          style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)' }}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span style={{ color: '#d8b4fe' }}>ML Model Status</span>
        </button>

        {/* Saved Notes Drawer Trigger */}
        <button
          onClick={onOpenSavedNotesModal}
          className="btn btn-secondary"
          title="View Saved Notes & Transcripts"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span>My Notes</span>
          {savedNotesCount > 0 && (
            <span className="badge badge-indigo" style={{ padding: '0.1rem 0.45rem', fontSize: '0.7rem' }}>
              {savedNotesCount}
            </span>
          )}
        </button>

        {/* AI Provider Configuration Trigger */}
        <button
          onClick={onOpenApiKeyModal}
          className="btn btn-secondary"
          title="Configure an API key, endpoint, and model for advanced LLM generation"
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span>API Key</span>
        </button>

        {/* Theme Switcher Dropdown / Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => onSelectTheme('cyber-dark')}
            className={`btn ${currentTheme === 'cyber-dark' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            title="Cyber Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectTheme('midnight-oled')}
            className={`btn ${currentTheme === 'midnight-oled' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            title="Midnight OLED Theme"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            onClick={() => onSelectTheme('nordic-light')}
            className={`btn ${currentTheme === 'nordic-light' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            title="Nordic Light Theme"
          >
            <Sun className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
