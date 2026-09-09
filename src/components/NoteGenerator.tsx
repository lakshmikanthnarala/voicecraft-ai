import React, { useState } from 'react';
import { Sparkles, ClipboardList, GraduationCap, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { NoteTemplateId, NoteTemplate } from '../types';

interface NoteGeneratorProps {
  onGenerate: (templateId: NoteTemplateId, customPrompt?: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

const TEMPLATES: NoteTemplate[] = [
  {
    id: 'summarized',
    name: 'Summarized',
    description: 'Clean bullets of the most important points.',
    iconName: 'ClipboardList',
    color: '#6366f1'
  },
  {
    id: 'flash-cards',
    name: 'Flash Cards',
    description: 'Short Q&A cards for quick memory review.',
    iconName: 'GraduationCap',
    color: '#f59e0b'
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Simple structured notes with key facts.',
    iconName: 'FileText',
    color: '#10b981'
  },
  {
    id: 'possible-questions',
    name: 'Questions',
    description: 'Likely questions and answers from the transcript.',
    iconName: 'HelpCircle',
    color: '#06b6d4'
  }
];

export const NoteGenerator: React.FC<NoteGeneratorProps> = ({
  onGenerate,
  isGenerating,
  disabled
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplateId>('summarized');

  const renderIcon = (iconName: string, color: string) => {
    const props = { className: 'w-6 h-6', style: { color } };
    switch (iconName) {
      case 'ClipboardList': return <ClipboardList {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'HelpCircle': return <HelpCircle {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const handleRun = () => {
    onGenerate(selectedTemplate);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Choose Note Format</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Turn the transcript into a clear and useful output.
          </p>
        </div>
        <span className="badge badge-amber">Step 2: Note Synthesis</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className="glass-card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? tmpl.color : 'var(--bg-card-border)',
                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                boxShadow: isSelected ? `0 0 20px ${tmpl.color}33` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                {renderIcon(tmpl.iconName, tmpl.color)}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tmpl.name}</h3>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tmpl.description}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleRun}
        disabled={disabled || isGenerating}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '0.85rem',
          fontSize: '1rem',
          opacity: disabled || isGenerating ? 0.5 : 1
        }}
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span>{isGenerating ? 'Synthesizing Note...' : 'Transform Transcript into Note'}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
