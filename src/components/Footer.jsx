import React from 'react';
import { Sparkle, Globe, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  const [status, setStatus] = React.useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    setStatus('Sending...');
    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatus('Message sent successfully!');
        e.target.reset();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`${data.error}`);
      }
    } catch (err) {
      setStatus('Failed to connect to backend server.');
    }
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--card-border)',
      padding: '80px 24px 40px',
      marginTop: '64px',
      background: 'var(--section-bg)'
    }}>
      <div className="section-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px', marginBottom: '64px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div className="metallic-wrapper" style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                <img src="/logo.png" alt="SmartConvert Logo" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                SMART<span style={{ color: 'var(--btn-primary)' }}>CONVERT</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
              The universal file transformation toolkit powered by intelligent AI and robust privacy protocols.
            </p>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
              <Globe size={20} style={{ cursor: 'pointer' }} />
              <Mail size={20} style={{ cursor: 'pointer' }} />
              <MessageCircle size={20} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: 'var(--ui-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '24px', color: 'var(--text-main)', fontSize: '1.1rem' }}>Send us a Message</h4>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Your Email ID" 
                  required 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--section-bg)', color: 'var(--text-main)', outline: 'none' }} 
                />
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Subject" 
                  required 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--section-bg)', color: 'var(--text-main)', outline: 'none' }} 
                />
              </div>
              <textarea 
                name="message" 
                placeholder="Your Message..." 
                required 
                rows="4" 
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--section-bg)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
              ></textarea>
              <button type="submit" className="btn-primary" style={{ padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                Submit Message
              </button>
              {status && (
                <div style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 500, color: status.includes('Error') || status.includes('Failed') || status.includes('SMTP') ? '#ef4444' : '#10b981' }}>
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--card-border)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <p>© 2026 SmartConvert AI. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Status: All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
