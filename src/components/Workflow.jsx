import React from 'react';
import { MousePointerClick, UploadCloud, Download, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: MousePointerClick,
    title: 'Select Your Tool',
    desc: 'Choose your desired conversion from our suite of PDF, DOCX, Image, and OCR tools.'
  },
  {
    step: '02',
    icon: UploadCloud,
    title: 'Upload Your File',
    desc: 'Drag & drop your files directly into the workspace or browse from your local device.'
  },
  {
    step: '03',
    icon: Download,
    title: 'Convert & Download',
    desc: 'Our engine processes the file in seconds. Review the in-browser preview and download.'
  }
];

const Workflow = () => {
  return (
    <section id="how-it-works" className="section-container workflow-section">
      <div style={{ textAlign: 'center' }}>
        <div className="section-badge">
          <span className="dot" />
          <span>Frictionless Flow</span>
        </div>
        <h2 className="section-title">
          How Smart Convertor Works.
        </h2>
        <p className="section-subtitle">
          Three simple steps to convert any document, image, or archive with pixel-perfect accuracy.
        </p>
      </div>

      <div className="timeline-container">
        {/* Horizontal line on Tablet/Desktop, vertical left rail on Mobile */}
        <div className="timeline-track" />

        <div className="timeline-grid">
          {steps.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div key={index} className="timeline-item-wrap">
                <div className="timeline-mobile-dot" aria-hidden="true" />
                <div className="timeline-card saas-card">
                  <div className="timeline-header">
                    <div className="step-number-pill">
                      {item.step}
                    </div>
                    <div className="step-icon-circle">
                      <IconComp size={24} color="#4338CA" />
                    </div>
                  </div>

                  <h3 className="step-title">
                    {item.title}
                  </h3>

                  <p className="step-desc">
                    {item.desc}
                  </p>

                  <div className="step-footer-pill">
                    <CheckCircle2 size={13} color="#2563EB" />
                    <span>Instant Execution</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .workflow-section {
          position: relative;
        }

        .timeline-container {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Mobile vertical rail */
        .timeline-track {
          position: absolute;
          top: 28px;
          bottom: 28px;
          left: 11px;
          width: 2px;
          background: linear-gradient(180deg, #4338CA 0%, #2563EB 50%, #8B5CF6 100%);
          opacity: 0.35;
          z-index: 1;
        }

        .timeline-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding-left: 34px;
          position: relative;
          z-index: 2;
        }

        .timeline-item-wrap {
          position: relative;
          min-width: 0;
          display: flex;
        }

        .timeline-mobile-dot {
          position: absolute;
          left: -29px;
          top: 24px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--gradient-primary);
          border: 3px solid var(--bg-main);
          box-shadow: 0 0 0 2px rgba(67, 56, 202, 0.2);
          z-index: 3;
        }

        @media (min-width: 768px) {
          .timeline-track {
            top: 56px;
            bottom: auto;
            left: 90px;
            right: 90px;
            width: auto;
            height: 2px;
            background: linear-gradient(90deg, #4338CA 0%, #2563EB 50%, #8B5CF6 100%);
          }

          .timeline-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            padding-left: 0;
          }

          .timeline-mobile-dot {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .timeline-track {
            top: 64px;
            left: 120px;
            right: 120px;
          }

          .timeline-grid {
            gap: 28px;
          }
        }

        .timeline-card {
          padding: 22px 18px;
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid var(--card-border);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }

        @media (min-width: 768px) {
          .timeline-card {
            padding: 24px 20px;
            border-radius: 22px;
          }
        }

        @media (min-width: 1024px) {
          .timeline-card {
            padding: 32px 28px;
            border-radius: 24px;
          }
        }

        .timeline-card:hover {
          transform: translateY(-5px);
          border-color: rgba(67, 56, 202, 0.3);
          box-shadow: 0 16px 36px -10px rgba(17, 24, 39, 0.08);
        }

        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
        }

        @media (min-width: 1024px) {
          .timeline-header {
            margin-bottom: 24px;
          }
        }

        .step-number-pill {
          background: var(--gradient-primary);
          color: #FFFFFF;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.85rem;
          padding: 4px 12px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .step-icon-circle {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 1024px) {
          .step-icon-circle {
            width: 50px;
            height: 50px;
            border-radius: 16px;
          }
        }

        .step-title {
          font-size: clamp(1.1rem, 2vw, 1.25rem);
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 10px;
        }

        .step-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 20px;
          flex-grow: 1;
        }

        .step-footer-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--color-secondary);
          background: rgba(37, 99, 235, 0.06);
          padding: 5px 12px;
          border-radius: 9999px;
          width: max-content;
          max-width: 100%;
        }
      `}</style>
    </section>
  );
};

export default Workflow;
