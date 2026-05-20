import React from 'react';
import { Upload, Settings, Download, ArrowRight } from 'lucide-react';

const Workflow = () => {
  const steps = [
    { icon: <Upload size={32} />, title: '1. Upload', desc: 'Drag and drop or select your files.' },
    { icon: <Settings size={32} />, title: '2. Configure', desc: 'AI auto-detects. You tweak if needed.' },
    { icon: <Download size={32} />, title: '3. Download', desc: 'Get your converted files instantly.' }
  ];

  return (
    <section id="how-it-works" className="section-container" style={{ textAlign: 'center' }}>
      <h2 className="section-title">Seamless Workflow</h2>
      <p className="section-subtitle">Three simple steps to transform any document.</p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        marginTop: '64px'
      }}>
        {/* Desktop Grid Layout */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          width: '100%'
        }}>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="glass-panel" style={{
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '1 1 250px',
                maxWidth: '300px',
                position: 'relative'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--ui-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: 'var(--btn-primary)',
                  boxShadow: 'inset 0 0 20px rgba(217, 230, 234, 0.5)'
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>

              {index < steps.length - 1 && (
                <div style={{ color: 'var(--text-muted)', display: 'flex', padding: '0 16px' }} className="step-arrow">
                  <ArrowRight size={32} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .step-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </section>
  );
};

export default Workflow;
