import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileArchive, 
  FileSymlink, 
  Scissors, 
  Type, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const toolsList = [
  { 
    id: 1, 
    tool: 'pdf-to-docx', 
    name: 'PDF to Word (DOCX)', 
    category: 'PDF', 
    desc: 'Extract formatted text into Microsoft Word',
    icon: FileText, 
    badge: 'Popular' 
  },
  { 
    id: 2, 
    tool: 'docx-to-pdf', 
    name: 'DOCX to PDF', 
    category: 'Document', 
    desc: 'Lock in document formatting and fonts',
    icon: FileText 
  },
  { 
    id: 3, 
    tool: 'image', 
    imageFormat: 'png', 
    name: 'JPG to PNG', 
    category: 'Image', 
    desc: 'Lossless transparent image format',
    icon: ImageIcon 
  },
  { 
    id: 4, 
    tool: 'image', 
    imageFormat: 'jpg', 
    name: 'PNG to JPG', 
    category: 'Image', 
    desc: 'Compact web format with small file size',
    icon: ImageIcon 
  },
  { 
    id: 5, 
    tool: 'compress-pdf', 
    name: 'PDF Compressor', 
    category: 'PDF', 
    desc: 'Shrink file size without losing readability',
    icon: FileArchive, 
    badge: 'High Speed' 
  },
  { 
    id: 6, 
    tool: 'merge-pdf', 
    name: 'PDF Merger', 
    category: 'PDF', 
    desc: 'Combine multiple PDF files into one master document',
    icon: FileSymlink 
  },
  { 
    id: 7, 
    tool: 'split-pdf', 
    name: 'PDF Splitter', 
    category: 'PDF', 
    desc: 'Separate PDF pages into individual files',
    icon: Scissors 
  },
  { 
    id: 8, 
    tool: 'ocr', 
    name: 'Neural OCR Extractor', 
    category: 'AI Tools', 
    desc: 'Extract selectable text from scanned photos & receipts',
    icon: Type, 
    badge: 'AI Powered' 
  },
  { 
    id: 9, 
    tool: 'image', 
    imageFormat: 'webp', 
    name: 'WEBP Converter', 
    category: 'Image', 
    desc: 'Next-gen web format for ultra-fast loading',
    icon: RefreshCw 
  },
  { 
    id: 10, 
    tool: 'img-to-pdf', 
    name: 'Image to PDF', 
    category: 'PDF', 
    desc: 'Collate photo collections into standard PDF',
    icon: ImageIcon 
  },
  { 
    id: 11, 
    tool: 'txt-to-pdf', 
    name: 'TXT to PDF', 
    category: 'Document', 
    desc: 'Convert plain text logs and notes into styled PDF',
    icon: FileText 
  }
];

const ConverterGrid = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'PDF', 'Image', 'Document', 'AI Tools'];

  const filteredTools = activeCategory === 'All'
    ? toolsList
    : toolsList.filter(t => t.category === activeCategory);

  const handleToolClick = (tool, imageFormat) => {
    window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool, imageFormat } }));
  };

  return (
    <section className="section-container converter-grid-section">
      <div style={{ textAlign: 'center' }}>
        <div className="section-badge">
          <span className="dot" />
          <span>Complete File Toolkit</span>
        </div>
        <h2 className="section-title">
          Supported Formats & Conversion Tools.
        </h2>
        <p className="section-subtitle">
          Select any conversion module below to automatically load and configure the primary engine.
        </p>

        {/* Category Pills */}
        <div className="category-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2 grid-3 grid-4" style={{ gap: '20px' }}>
        {filteredTools.map((tool) => {
          const IconComp = tool.icon;
          return (
            <div 
              key={tool.id} 
              className="saas-card tool-grid-card"
              onClick={() => handleToolClick(tool.tool, tool.imageFormat)}
            >
              <div className="tool-card-top">
                <div className="tool-card-icon">
                  <IconComp size={22} color="#4338CA" />
                </div>
                {tool.badge && (
                  <span className="tool-badge-pill">{tool.badge}</span>
                )}
              </div>

              <h3 className="tool-card-title">
                {tool.name}
              </h3>

              <p className="tool-card-desc">
                {tool.desc}
              </p>

              <div className="tool-card-action">
                <span>Launch Tool</span>
                <ArrowRight size={15} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .converter-grid-section {
          position: relative;
        }

        .category-filter-bar {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2F6;
          padding: 6px;
          border-radius: 18px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 100%;
        }

        @media (min-width: 640px) {
          .category-filter-bar {
            gap: 8px;
            border-radius: 9999px;
            margin-bottom: 48px;
          }
        }

        .cat-pill-btn {
          background: transparent;
          border: none;
          min-height: 40px;
          padding: 8px 14px;
          border-radius: 12px;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (min-width: 640px) {
          .cat-pill-btn {
            border-radius: 9999px;
            padding: 8px 18px;
            font-size: 0.875rem;
          }
        }

        .cat-pill-btn:hover {
          color: var(--text-main);
        }

        .cat-pill-btn.active {
          background: #FFFFFF;
          color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(17, 24, 39, 0.08);
        }

        .tool-grid-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tool-grid-card:hover {
          transform: translateY(-4px);
          border-color: rgba(67, 56, 202, 0.35);
          box-shadow: 0 12px 28px -6px rgba(17, 24, 39, 0.08);
        }

        .tool-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .tool-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }

        .tool-grid-card:hover .tool-card-icon {
          transform: scale(1.08);
        }

        .tool-badge-pill {
          background: rgba(37, 99, 235, 0.1);
          color: var(--color-secondary);
          font-size: 0.725rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.02em;
        }

        .tool-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .tool-card-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 18px;
          flex-grow: 1;
        }

        .tool-card-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--color-primary);
          transition: gap 0.2s ease;
        }

        .tool-grid-card:hover .tool-card-action {
          gap: 10px;
        }
      `}</style>
    </section>
  );
};

export default ConverterGrid;