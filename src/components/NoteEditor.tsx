import React, { useState } from 'react';
import { 
  FileCheck, Download, Copy, Printer, Save, Edit3, Eye, 
  GitBranch, CheckSquare, Tag, Plus, Trash2, Check, Sparkles 
} from 'lucide-react';
import { CustomNote, ActionItem } from '../types';
import { MindMapView } from './MindMapView';
import { exportNoteAsMarkdown, exportNoteAsText, printFormattedNote, copyToClipboard } from '../services/exportService';

interface NoteEditorProps {
  note: CustomNote | null;
  onSaveNote: (updatedNote: CustomNote) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSaveNote
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'mindmap'>('preview');
  const [copied, setCopied] = useState(false);
  const [newTag, setNewTag] = useState('');

  if (!note) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <FileCheck className="w-12 h-12 text-purple-400/40" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Note Synthesized Yet</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Select a template above and click "Transform Transcript into Customizable Note" to generate your note.
        </p>
      </div>
    );
  }

  const handleMarkdownChange = (newMarkdown: string) => {
    onSaveNote({
      ...note,
      contentMarkdown: newMarkdown
    });
  };

  const handleToggleActionItem = (itemId: string) => {
    if (!note.actionItems) return;
    const updatedItems = note.actionItems.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onSaveNote({
      ...note,
      actionItems: updatedItems
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (note.tags.includes(newTag.trim())) return;
    onSaveNote({
      ...note,
      tags: [...note.tags, newTag.trim()]
    });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onSaveNote({
      ...note,
      tags: note.tags.filter(t => t !== tagToRemove)
    });
  };

  const handleCopy = async () => {
    await copyToClipboard(note.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">{note.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span className="badge badge-emerald">{note.templateId}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {note.date}</span>
          </div>
        </div>

        {/* Action Controls & Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => exportNoteAsMarkdown(note)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            title="Download as Markdown .md file"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>.MD</span>
          </button>

          <button
            onClick={() => exportNoteAsText(note)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            title="Download as Plain Text .txt file"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>.TXT</span>
          </button>

          <button
            onClick={() => printFormattedNote(note)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            title="Print or Save as PDF Report"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      {/* Mode View Switcher Tabs (Preview vs Edit vs Mind Map) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('preview')}
          className={`btn ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <Eye className="w-4 h-4" />
          <span>Formatted Note</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <Edit3 className="w-4 h-4" />
          <span>Markdown Editor</span>
        </button>

        {note.mindMap && note.mindMap.length > 0 && (
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`btn ${activeTab === 'mindmap' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Mind Map View</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'preview' && (
        <div className="markdown-preview" style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)', minHeight: '300px' }}>
          
          {/* Render Action Items Checkboxes if present */}
          {note.actionItems && note.actionItems.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckSquare className="w-4 h-4" /> Interactive Task Checklist
              </h3>
              {note.actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleActionItem(item.id)}
                  className={`task-item ${item.completed ? 'completed' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Render Flashcards if present */}
          {note.flashcards && note.flashcards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fcd34d', marginBottom: '0.75rem' }}>
                💡 Q&A Flashcards
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                {note.flashcards.map((fc, i) => (
                  <div key={fc.id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.3rem' }}>
                      CARD #{i + 1}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>{fc.question}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{fc.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render Full Markdown Body */}
          <div dangerouslySetInnerHTML={{ 
            __html: note.contentMarkdown
              .replace(/# (.*)/g, '<h1 style="font-size:1.5rem;font-weight:800;color:var(--accent-primary);margin-top:1rem">$1</h1>')
              .replace(/## (.*)/g, '<h2 style="font-size:1.2rem;font-weight:700;margin-top:0.8rem;color:var(--text-primary)">$1</h2>')
              .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:600;margin-top:0.6rem">$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/- (.*)/g, '<li style="margin-left:1.2rem">$1</li>')
              .replace(/\n/g, '<br/>')
          }} />
        </div>
      )}

      {activeTab === 'edit' && (
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            rows={14}
            value={note.contentMarkdown}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--accent-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              outline: 'none'
            }}
          />
        </div>
      )}

      {activeTab === 'mindmap' && note.mindMap && (
        <MindMapView nodes={note.mindMap} />
      )}

      {/* Tag Manager */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag className="w-3.5 h-3.5" /> Note Tags:
        </span>

        {note.tags.map((tag) => (
          <span key={tag} className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>#{tag}</span>
            <Trash2 
              onClick={() => handleRemoveTag(tag)}
              className="w-3 h-3 text-slate-400 hover:text-rose-400 cursor-pointer" 
            />
          </span>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              outline: 'none',
              width: '100px'
            }}
          />
          <button onClick={handleAddTag} className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-full)' }}>
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
