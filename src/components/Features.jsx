import React from 'react';
import { 
  Layers, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Download,
  ArrowUpRight
} from 'lucide-react';

const featuresList = [
  {
    icon: Layers,
    color: '#4338CA',
    bg: 'rgba(67, 56, 202, 0.08)',
    title: 'Multiple File Format Support',
    description: 'Transform across PDFs, Microsoft Word (DOCX), images (JPG, PNG, WEBP), and extracted text files with unmatched formatting precision.'
  },
  {
    icon: Zap,
    color: '#2563EB',
    bg: 'rgba(37, 99, 235, 0.08)',
    title: 'Fast File Conversion',
    description: 'Powered by an optimized parallel execution engine that completes multi-page document conversions and compression in milliseconds.'
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    title: 'Secure File Processing',
    description: 'Strict zero-retention policy. Documents are isolated in memory, strictly encrypted, and permanently deleted after your download.'
  },
  {
    icon: Sparkles,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    title: 'Simple User Experience',
    description: 'Frictionless drag-and-drop interface with intelligent format detection. Zero complex configurations or confusing menus.'
  },
  {
    icon: Eye,
    color: '#0284C7',
    bg: 'rgba(2, 132, 199, 0.08)',
    title: 'Instant File Previews',
    description: 'Preview your converted PDFs, documents, and images directly in the browser before saving them locally to verify quality.'
  },
  {
    icon: Download,
    color: '#D97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    title: 'Instant Direct Downloads',
    description: 'One-click direct downloads with high-speed bandwidth, preserving exact image resolutions, metadata, and document fidelity.'
  }
];

const Features = () => {
  return (
    <section id="features" className="section-container">
      <div style={{ textAlign: 'center' }}>
        <div className="section-badge">
          <span className="dot" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="section-title">
          Engineered for Speed, Precision & Privacy.
        </h2>
        <p className="section-subtitle">
          Everything you need for effortless document transformation, built with enterprise-grade standards.
        </p>
      </div>

      <div className="grid grid-2 grid-3 features-grid">
        {featuresList.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div 
              key={index} 
              className="saas-card feature-card"
            >
              <div 
                className="feature-icon-box"
                style={{ background: item.bg, color: item.color }}
              >
                <IconComp size={26} />
              </div>

              <h3 className="feature-title">
                {item.title}
              </h3>

              <p className="feature-desc">
                {item.description}
              </p>

              <div className="feature-card-accent" style={{ background: item.color }} />
            </div>
          );
        })}
      </div>

      <style>{`
        .features-grid {
          gap: 18px;
        }

        @media (min-width: 768px) {
          .features-grid {
            gap: 24px;
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            gap: 28px;
          }
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 22px 18px;
          border-radius: 20px;
          border: 1px solid var(--card-border);
          background: #FFFFFF;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          height: 100%;
        }

        @media (min-width: 768px) {
          .feature-card {
            padding: 28px 24px;
          }
        }

        @media (min-width: 1024px) {
          .feature-card {
            padding: 32px 28px;
          }
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 16px 32px -8px rgba(17, 24, 39, 0.08);
        }

        .feature-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon-box {
          transform: scale(1.08);
        }

        .feature-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .feature-desc {
          font-size: 0.925rem;
          color: var(--text-muted);
          line-height: 1.65;
        }

        .feature-card-accent {
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 3px;
          border-radius: 0 0 4px 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover .feature-card-accent {
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Features;