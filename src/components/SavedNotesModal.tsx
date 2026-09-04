import React, { useState } from 'react';
import { X, FolderOpen, Search, Trash2, ArrowRight, Tag, Calendar, FileText } from 'lucide-react';
import { CustomNote } from '../types';

interface SavedNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: CustomNote[];
  onSelectNote: (note: CustomNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const SavedNotesModal: React.FC<SavedNotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onDeleteNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen className="w-6 h-6 text-indigo-400" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>My Saved Notes Library ({notes.length})</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search saved notes by title or #tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Notes List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No notes found. Record voice or select a template to create notes!
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="glass-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{note.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar className="w-3 h-3" /> {note.date}</span>
                    <span>•</span>
                    <span className="badge badge-indigo" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>{note.templateId}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      onSelectNote(note);
                      onClose();
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.5rem', color: '#f43f5e' }}
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
