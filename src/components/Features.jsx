import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

const Features = () => {
  return (
    <section id="how-it-works" className="section-container" style={{ position: 'relative' }}>
      
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'var(--accent-blob)',
        zIndex: -1,
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.5
      }} />

      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 className="section-title">Smart. Secure. Seamless.</h2>
        <p className="section-subtitle">
          Built with cutting-edge technology to ensure your data stays yours, while delivering unparalleled conversion speeds.
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: '32px' }}>
        {/* Feature 1 */}
        <div className="glass-panel" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            Privacy-First Offline Processing
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Your sensitive documents never leave your device. Our advanced WebAssembly engine processes everything locally in your browser, guaranteeing zero-data retention and absolute privacy.
          </p>
          
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
            <ShieldCheck size={200} />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(77, 168, 255, 0.1)', color: 'var(--btn-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Cpu size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            AI Smart File Detection
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Stop guessing formats. Our neural engine automatically detects file structures, fixes corrupt headers, and selects the optimal conversion algorithm for the highest quality output.
          </p>
          
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}>
            <Cpu size={200} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
