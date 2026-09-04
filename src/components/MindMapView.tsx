import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Circle, GitBranch } from 'lucide-react';
import { MindMapNode } from '../types';

interface MindMapViewProps {
  nodes: MindMapNode[];
}

const TreeNode: React.FC<{ node: MindMapNode; level: number }> = ({ node, level }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const indentStyle = { paddingLeft: `${level * 1.5}rem` };

  return (
    <div style={{ marginTop: '0.4rem' }}>
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: level === 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--bg-card-border)',
          cursor: hasChildren ? 'pointer' : 'default',
          ...indentStyle
        }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-indigo-400" />
        ) : (
          <Circle className="w-2.5 h-2.5 text-purple-400" />
        )}
        <span style={{ fontSize: level === 0 ? '1rem' : '0.875rem', fontWeight: level === 0 ? 700 : 500, color: 'var(--text-primary)' }}>
          {node.title}
        </span>
      </div>

      {hasChildren && expanded && (
        <div style={{ borderLeft: '2px solid rgba(99, 102, 241, 0.2)', marginLeft: `${level * 1.5 + 0.8}rem` }}>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapView: React.FC<MindMapViewProps> = ({ nodes }) => {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
        <GitBranch className="w-5 h-5 text-purple-400" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Interactive Mind Map Hierarchy</h3>
      </div>
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
};
