import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileArchive, 
  FileSymlink, 
  Scissors, 
  Type, 
  RefreshCw,
  Zap
} from 'lucide-react';

const tools = [
  { id: 1, name: 'PDF to DOCX', icon: <FileText size={28} />, color: '#4DA8FF' },
  { id: 2, name: 'DOCX to PDF', icon: <FileText size={28} />, color: '#4DA8FF' },
  { id: 3, name: 'JPG to PNG', icon: <ImageIcon size={28} />, color: '#10b981' },
  { id: 4, name: 'PNG to JPG', icon: <ImageIcon size={28} />, color: '#f59e0b' },
  { id: 5, name: 'PDF Compressor', icon: <FileArchive size={28} />, color: '#8b5cf6' },
  { id: 6, name: 'PDF Merger', icon: <FileSymlink size={28} />, color: '#06b6d4' },
  { id: 7, name: 'PDF Splitter', icon: <Scissors size={28} />, color: '#f43f5e' },
  { id: 8, name: 'OCR Extract', icon: <Type size={28} />, color: '#8b5cf6' },
  { id: 9, name: 'WEBP Converter', icon: <RefreshCw size={28} />, color: '#14b8a6' },
  { id: 10, name: 'Image to PDF', icon: <ImageIcon size={28} />, color: '#ec4899' },
];

const ConverterGrid = () => {
  return (
    <section id="features" className="section-container" style={{ background: 'var(--section-bg)', borderRadius: '32px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 className="section-title">Supported Formats & Tools</h2>
        <p className="section-subtitle">
          Everything you need in one place. Powered by smart AI detection to handle your files with precision.
        </p>
      </div>

      <div className="grid grid-2 grid-4" style={{ gap: '24px' }}>
        {tools.map((tool, index) => (
          <div 
            key={tool.id} 
            className="glass-panel"
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${index * 0.1}s`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 12px 30px rgba(217, 230, 234, 0.8)`;
              e.currentTarget.style.borderColor = `var(--btn-primary)`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 230, 234, 0.6)';
              e.currentTarget.style.borderColor = 'var(--card-border)';
            }}
          >
            <div style={{
              background: `${tool.color}15`,
              color: tool.color,
              padding: '16px',
              borderRadius: '16px',
              zIndex: 1
            }}>
              {tool.icon}
            </div>
            
            <h3 style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 600, 
              fontSize: '1.1rem',
              zIndex: 1
            }}>
              {tool.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ConverterGrid;
