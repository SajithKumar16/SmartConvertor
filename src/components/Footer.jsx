import React, { useState } from 'react';
import { Sparkles, Globe, Mail, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    setIsSubmitting(true);
    setStatus('Sending...');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatus(data.message || 'Message sent successfully! Our team will respond shortly.');
        e.target.reset();
        setTimeout(() => setStatus(''), 4500);
      } else {
        setStatus(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setStatus('Unable to connect to contact server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="section-container footer-container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/logo.png" alt="SmartConvert" className="footer-logo-img" />
              <span className="brand-text">
                Smart<span className="brand-accent">Convert</span>
              </span>
            </Link>

            <p className="footer-tagline">
              The modern universal document and media conversion platform. High performance, zero quality degradation, and strict privacy protocols.
            </p>

            <div className="footer-social-row">
              <a href="#" className="social-icon-btn" title="Global Network">
                <Globe size={18} />
              </a>
              <a href="mailto:support@smartconvert.local" className="social-icon-btn" title="Email Support">
                <Mail size={18} />
              </a>
              <a href="#" className="social-icon-btn" title="Community Chat">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#workspace" onClick={(e) => scrollToSection(e, 'workspace')}>
                  Workspace
                </a>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Get Started</Link>
              </li>
            </ul>
          </div>

          {/* Popular Tools Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Conversion Tools</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool: 'pdf-to-docx' } }));
                }}>
                  PDF to DOCX
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool: 'image', imageFormat: 'png' } }));
                }}>
                  Image to PNG / WEBP
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool: 'compress-pdf' } }));
                }}>
                  PDF Compressor
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool: 'ocr' } }));
                }}>
                  OCR Text Extractor
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool: 'merge-pdf' } }));
                }}>
                  Merge Multiple PDFs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Support Column */}
          <div className="footer-contact-col">
            <div className="contact-box-card">
              <h4 className="contact-box-title">Get in Touch</h4>
              <p className="contact-box-sub">Have questions or feedback? Send us a direct message.</p>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="input-group-row">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Your email address" 
                    required 
                    className="footer-input"
                  />
                  <input 
                    type="text" 
                    name="subject" 
                    placeholder="Subject" 
                    required 
                    className="footer-input"
                  />
                </div>

                <textarea 
                  name="message" 
                  placeholder="How can we help you?" 
                  required 
                  rows="3" 
                  className="footer-textarea"
                />

                <button 
                  type="submit" 
                  className="btn-primary contact-submit-btn"
                  disabled={isSubmitting}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>

                {status && (
                  <div className={`status-alert ${status.includes('success') ? 'status-ok' : 'status-err'}`}>
                    {status.includes('success') ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{status}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} SmartConvert Platform. All rights reserved. Built for seamless productivity.
          </p>

          <div className="footer-status-pill">
            <span className="live-pulse-dot" />
            <span>All conversion services operational</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-wrapper {
          border-top: 1px solid var(--card-border);
          background: #FFFFFF;
          position: relative;
          z-index: 10;
        }

        .footer-container {
          padding-top: 48px;
          padding-bottom: max(28px, env(safe-area-inset-bottom));
        }

        @media (min-width: 768px) {
          .footer-container {
            padding-top: 72px;
            padding-bottom: 36px;
          }
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 40px;
        }

        .footer-top-grid > div {
          min-width: 0;
        }

        @media (min-width: 768px) {
          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
            margin-bottom: 52px;
          }
        }

        @media (min-width: 1024px) {
          .footer-top-grid {
            grid-template-columns: 1.4fr 0.9fr 1fr 1.8fr;
            gap: 28px;
            margin-bottom: 60px;
          }
        }

        @media (min-width: 1280px) {
          .footer-top-grid {
            grid-template-columns: 1.5fr 1fr 1fr 2fr;
            gap: 48px;
            margin-bottom: 64px;
          }
        }

        .footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-main);
          margin-bottom: 16px;
        }

        .footer-logo-img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          display: block;
        }

        .footer-tagline {
          font-size: 0.925rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 22px;
          max-width: 340px;
        }

        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .social-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #F8FAFC;
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .social-icon-btn:hover {
          color: var(--color-primary);
          background: #EEF2FF;
          border-color: rgba(67, 56, 202, 0.3);
          transform: translateY(-2px);
        }

        .footer-col-title {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-links-list a {
          text-decoration: none;
          font-size: 0.925rem;
          color: var(--text-muted);
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 4px 0;
        }

        .footer-links-list a:hover {
          color: var(--color-primary);
          transform: translateX(3px);
        }

        /* Contact Box in Footer */
        .contact-box-card {
          background: #F8FAFC;
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 20px;
        }

        @media (min-width: 768px) {
          .contact-box-card {
            padding: 24px;
          }
        }

        .contact-box-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .contact-box-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-group-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 481px) {
          .input-group-row {
            flex-direction: row;
          }
        }

        .footer-input, .footer-textarea {
          width: 100%;
          min-width: 0;
          min-height: 44px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: #FFFFFF;
          color: var(--text-main);
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .footer-textarea {
          resize: vertical;
          min-height: 90px;
        }

        .contact-submit-btn {
          width: 100%;
          min-height: 44px;
          padding: 10px 18px;
          font-size: 0.9rem;
        }

        .status-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.825rem;
          padding: 10px 12px;
          border-radius: 8px;
          margin-top: 4px;
          overflow-wrap: break-word;
        }

        .status-ok {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }

        .status-err {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          border-top: 1px solid var(--card-border-subtle);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        @media (min-width: 640px) {
          .footer-bottom-bar {
            flex-direction: row;
            align-items: center;
          }
        }

        .footer-copy {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .footer-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.825rem;
          font-weight: 600;
          color: #059669;
          background: #ECFDF5;
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid #D1FAE5;
        }

        .live-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }
      `}</style>
    </footer>
  );
};

export default Footer;