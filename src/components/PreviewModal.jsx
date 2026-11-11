import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Copy, Check, FileText } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, previewData }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !previewData) return null;

  const { url, filename = 'converted_file', type = '', textContent = '' } = previewData;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isImage = type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  const isText = type.startsWith('text/') || ext === 'txt';
  const isPdf = type === 'application/pdf' || ext === 'pdf';

  const handleCopyText = async () => {
    if (!textContent) return;
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  return (
    <div className="preview-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="File Preview">
      <div className="preview-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-modal-header">
          <div className="preview-modal-title-group">
            <div className="preview-modal-icon">
              <FileText size={18} color="#4338CA" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 className="preview-modal-title">{filename}</h3>
              <span className="preview-modal-sub">Instant In-Browser Preview</span>
            </div>
          </div>

          <button type="button" className="preview-close-btn" onClick={onClose} aria-label="Close preview">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="preview-modal-body">
          {isImage && url && (
            <div className="preview-image-wrap">
              <img src={url} alt={filename} className="preview-image-el" />
            </div>
          )}

          {isText && (
            <div className="preview-text-wrap">
              <div className="preview-text-toolbar">
                <span>Extracted / Converted Text</span>
                <button type="button" className="preview-copy-btn" onClick={handleCopyText}>
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="preview-text-pre">{textContent || 'Loading text...'}</pre>
            </div>
          )}

          {isPdf && url && (
            <div className="preview-pdf-wrap">
              <iframe src={url} title={filename} className="preview-pdf-frame" />
              <p className="preview-pdf-mobile-hint">
                On some mobile browsers, PDF embeds open best in a full tab. Use &ldquo;Open in New Tab&rdquo; or &ldquo;Download&rdquo; below.
              </p>
            </div>
          )}

          {!isImage && !isText && !isPdf && (
            <div className="preview-unsupported-wrap">
              <FileText size={42} color="#64748B" />
              <h4>Document Ready for Download</h4>
              <p>
                Files in <strong>.{ext.toUpperCase() || 'DOCX/ZIP'}</strong> format cannot be rendered inline by web browsers. Click Download below to open it locally.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="preview-modal-footer">
          {url && (
            <>
              <a href={url} target="_blank" rel="noreferrer" className="btn-secondary preview-footer-btn">
                <ExternalLink size={16} />
                <span>Open in New Tab</span>
              </a>
              <a href={url} download={filename} className="btn-primary preview-footer-btn">
                <Download size={16} />
                <span>Download File</span>
              </a>
            </>
          )}
        </div>
      </div>

      <style>{`
        .preview-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(17, 24, 39, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
        }

        .preview-modal-card {
          width: 100%;
          max-width: 820px;
          max-height: 90vh;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          border-radius: 22px;
          box-shadow: 0 25px 50px -12px rgba(17, 24, 39, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .preview-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--card-border-subtle);
          background: #FAFBFE;
        }

        .preview-modal-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .preview-modal-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .preview-modal-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-modal-sub {
          font-size: 0.775rem;
          color: var(--text-muted);
          display: block;
        }

        .preview-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #F1F5F9;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .preview-close-btn:hover {
          background: #E2E8F0;
          color: var(--text-main);
        }

        .preview-modal-body {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
          background: #F8FAFC;
        }

        @media (min-width: 640px) {
          .preview-modal-body {
            padding: 24px;
          }
        }

        .preview-image-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 12px;
        }

        .preview-image-el {
          max-width: 100%;
          max-height: 58vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .preview-text-wrap {
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          border-radius: 14px;
          overflow: hidden;
        }

        .preview-text-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #F1F5F9;
          border-bottom: 1px solid var(--card-border);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .preview-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          min-height: 36px;
          border-radius: 8px;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          color: var(--text-main);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .preview-text-pre {
          padding: 16px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-main);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 52vh;
          overflow-y: auto;
        }

        .preview-pdf-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-pdf-frame {
          width: 100%;
          height: 56vh;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          background: #FFFFFF;
        }

        .preview-pdf-mobile-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
        }

        .preview-unsupported-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          border-radius: 14px;
          gap: 10px;
        }

        .preview-unsupported-wrap p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        .preview-modal-footer {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--card-border-subtle);
          background: #FFFFFF;
        }

        @media (min-width: 540px) {
          .preview-modal-footer {
            flex-direction: row;
            justify-content: flex-end;
          }
        }

        .preview-footer-btn {
          width: 100%;
        }

        @media (min-width: 540px) {
          .preview-footer-btn {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewModal;
