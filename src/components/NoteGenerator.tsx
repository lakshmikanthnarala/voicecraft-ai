import React, { useState } from 'react';
import { Sparkles, ClipboardList, CheckSquare, GraduationCap, Users, GitFork, Sliders, ArrowRight } from 'lucide-react';
import { NoteTemplateId, NoteTemplate } from '../types';

interface NoteGeneratorProps {
  onGenerate: (templateId: NoteTemplateId, customPrompt?: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

const TEMPLATES: NoteTemplate[] = [
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    description: 'High-level synthesis, key takeaways, and strategic pillars.',
    iconName: 'ClipboardList',
    color: '#6366f1'
  },
  {
    id: 'action-items',
    name: 'Action Items & Tasks',
    description: 'Extracted task checklist with priority badges & owners.',
    iconName: 'CheckSquare',
    color: '#10b981'
  },
  {
    id: 'study-flashcards',
    name: 'Study Notes & Flashcards',
    description: 'Academic concepts, definitions, and Q&A flashcards.',
    iconName: 'GraduationCap',
    color: '#f59e0b'
  },
  {
    id: 'meeting-minutes',
    name: 'Meeting Minutes',
    description: 'Structured agenda, discussion points, and agreed decisions.',
    iconName: 'Users',
    color: '#06b6d4'
  },
  {
    id: 'mind-map',
    name: 'Mind Map Outline',
    description: 'Hierarchical node tree breakdown of themes and subpoints.',
    iconName: 'GitFork',
    color: '#a855f7'
  },
  {
    id: 'custom-prompt',
    name: 'Custom AI Transformer',
    description: 'Custom instructions (e.g., Slack update, ELI5, Email draft).',
    iconName: 'Sliders',
    color: '#ec4899'
  }
];

export const NoteGenerator: React.FC<NoteGeneratorProps> = ({
  onGenerate,
  isGenerating,
  disabled
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplateId>('executive-brief');
  const [customPrompt, setCustomPrompt] = useState('');

  const renderIcon = (iconName: string, color: string) => {
    const props = { className: "w-6 h-6", style: { color } };
    switch (iconName) {
      case 'ClipboardList': return <ClipboardList {...props} />;
      case 'CheckSquare': return <CheckSquare {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Users': return <Users {...props} />;
      case 'GitFork': return <GitFork {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const handleRun = () => {
    onGenerate(selectedTemplate, selectedTemplate === 'custom-prompt' ? customPrompt : undefined);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Customize Note Output & AI Presets</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Select how you want your voice transcript to be transformed.
          </p>
        </div>
        <span className="badge badge-amber">Step 2: Note Synthesis</span>
      </div>

      {/* Preset Template Grid */}
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

      {/* Custom Prompt Textarea if Custom Prompt selected */}
      {selectedTemplate === 'custom-prompt' && (
        <div className="animate-fade-in" style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.4rem' }}>
            ✏️ ENTER CUSTOM FORMATTING INSTRUCTION OR PROMPT
          </label>
          <input
            type="text"
            placeholder="e.g. Format as a Slack message, translate key points to Spanish, or explain like I'm 5..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--accent-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Generate Action CTA */}
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
        <span>{isGenerating ? 'Synthesizing Note...' : 'Transform Transcript into Customizable Note'}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
