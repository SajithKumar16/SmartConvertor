import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  ArrowRight, 
  Loader2, 
  ChevronDown, 
  Check, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  FileCode, 
  Download, 
  RefreshCcw, 
  X, 
  Sparkles,
  Zap,
  Shield,
  Layers,
  Eye
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import PreviewModal from './PreviewModal';
import { saveSessionPreview, resolveSafePreviewUrl } from '../utils/previewHelper';

const TOOL_OPTIONS = [
  { value: 'image', label: 'Image Converter', desc: 'Convert JPG, PNG, WEBP', icon: ImageIcon },
  { value: 'pdf-to-docx', label: 'PDF to Word (DOCX)', desc: 'Editable Word documents', icon: FileText },
  { value: 'img-to-pdf', label: 'Image to PDF', desc: 'Turn photos into PDF', icon: FileCheck },
  { value: 'compress-pdf', label: 'Compress PDF', desc: 'Reduce file size', icon: Layers },
  { value: 'ocr', label: 'OCR Text Extractor', desc: 'Extract text from images', icon: Sparkles },
  { value: 'docx-to-pdf', label: 'DOCX to PDF', desc: 'Preserve formatting in PDF', icon: FileText },
  { value: 'txt-to-pdf', label: 'TXT to PDF', desc: 'Clean document layout', icon: FileCode },
  { value: 'merge-pdf', label: 'Merge Multiple PDFs', desc: 'Combine multiple files', icon: Layers },
  { value: 'split-pdf', label: 'Split PDF Pages', desc: 'Extract individual pages', icon: FileText }
];

const IMAGE_FORMATS = [
  { value: 'png', label: 'to PNG (Lossless)' },
  { value: 'jpg', label: 'to JPG (Compressed)' },
  { value: 'webp', label: 'to WEBP (Ultra-light)' }
];

const CustomSelect = ({ value, options, onChange, label, width = '100%' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(opt => opt.value === value) || options[0];
  const IconComponent = selected.icon;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width }}>
      {label && (
        <span style={{ 
          display: 'block', 
          fontSize: '0.775rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          marginBottom: '6px' 
        }}>
          {label}
        </span>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          minHeight: '46px',
          padding: '10px 14px',
          borderRadius: '14px',
          border: isOpen ? '1px solid var(--color-secondary)' : '1px solid var(--card-border)',
          background: '#FFFFFF',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.925rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          {IconComponent && <IconComponent size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
          <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected.label}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          style={{ 
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }} 
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#FFFFFF',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 150,
          maxHeight: '280px',
          overflowY: 'auto',
          padding: '6px',
          animation: 'fade-in-up 0.15s ease forwards'
        }}>
          {options.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  minHeight: '44px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(67, 56, 202, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                  transition: 'background 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {OptIcon && <OptIcon size={16} style={{ flexShrink: 0 }} color={isSelected ? 'var(--color-primary)' : 'var(--text-muted)'} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem', overflowWrap: 'break-word' }}>{opt.label}</div>
                    {opt.desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflowWrap: 'break-word' }}>{opt.desc}</div>}
                  </div>
                </div>
                {isSelected && <Check size={16} style={{ flexShrink: 0 }} color="var(--color-primary)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  const [action, setAction] = useState('pdf-to-docx');
  const [imageFormat, setImageFormat] = useState('png');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedResult, setConvertedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalData, setPreviewModalData] = useState(null);
  const fileInputRef = useRef(null);

  // Allow external triggers (e.g. from ConverterGrid) to change tool
  useEffect(() => {
    const handleSelectTool = (e) => {
      if (e.detail && e.detail.tool) {
        setAction(e.detail.tool);
        if (e.detail.imageFormat) {
          setImageFormat(e.detail.imageFormat);
        }
        const card = document.querySelector('.workspace-card');
        if (card) {
          const topOffset = card.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('selectTool', handleSelectTool);
    return () => window.removeEventListener('selectTool', handleSelectTool);
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setConvertedResult(null);
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);
      setConvertedResult(null);
      setErrorMessage('');
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setConvertedResult(null);
    setErrorMessage('');
    setConversionProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      fileInputRef.current?.click();
      return;
    }

    if (action === 'merge-pdf' && selectedFiles.length < 2) {
      setErrorMessage('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsConverting(true);
    setErrorMessage('');
    setConversionProgress(20);

    const progressInterval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 85) return prev;
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    if (action === 'merge-pdf') {
      selectedFiles.forEach((file) => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    let endpoint = `${API_BASE_URL}/api/convert`;

    if (action === 'image') {
      formData.append('targetFormat', imageFormat);
    } else {
      formData.append('targetFormat', action);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setConversionProgress(95);

      if (!response.ok) {
        let errText = 'Conversion failed. Please verify the file format.';
        try {
          const errData = await response.json();
          errText = errData.detail || errData.error || errText;
        } catch (e) {}
        throw new Error(errText);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'converted_file';
      if (contentDisposition && contentDisposition.includes('filename="')) {
        filename = contentDisposition.split('filename="')[1].split('"')[0];
      } else {
        let ext = 'pdf';
        if (action === 'image') ext = imageFormat;
        else if (action === 'pdf-to-docx') ext = 'docx';
        else if (action === 'split-pdf') ext = 'zip';
        else if (action === 'ocr') ext = 'txt';
        else if (action.includes('-to-')) ext = action.split('-to-')[1];
        filename = `converted_${Date.now()}.${ext}`;
      }

      const rawPreviewUrl = response.headers.get('X-Preview-URL');
      const safePreviewUrl = resolveSafePreviewUrl(rawPreviewUrl);
      const isTextOutput = blob.type.startsWith('text/') || filename.toLowerCase().endsWith('.txt');
      let textContent = '';
      if (isTextOutput) {
        try {
          textContent = await blob.text();
        } catch (e) {}
      }

      const conversionDate = new Date().toISOString();

      saveSessionPreview(conversionDate, {
        url: blobUrl,
        filename,
        type: blob.type,
        textContent
      });

      setConvertedResult({
        blob,
        url: blobUrl,
        filename,
        type: blob.type,
        textContent,
        previewUrl: safePreviewUrl || blobUrl,
        size: formatFileSize(blob.size)
      });
      setConversionProgress(100);

      // Trigger automatic direct download for immediate gratification
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Save to local storage for Dashboard fallback
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      let displayTarget = action.toUpperCase();
      if (action === 'image') displayTarget = imageFormat.toUpperCase();
      else if (action.includes('-to-')) displayTarget = action.split('-to-')[1].toUpperCase();

      const conversionData = {
        name: selectedFiles.length > 1 ? `${selectedFiles.length} files merged` : selectedFiles[0].name,
        to: displayTarget,
        size: selectedFiles.length > 1 ? 'Multiple' : formatFileSize(selectedFiles[0].size),
        status: 'Completed',
        date: conversionDate,
        url: safePreviewUrl || ''
      };

      history.unshift(conversionData);
      localStorage.setItem('conversions', JSON.stringify(history.slice(0, 15)));
      window.dispatchEvent(new Event('conversionUpdated'));

      // Save to Firestore if user logged in
      if (auth.currentUser) {
        addDoc(collection(db, `users/${auth.currentUser.uid}/conversions`), {
          ...conversionData,
          timestamp: serverTimestamp()
        }).catch(err => console.error("Firestore sync error: ", err));
      }

    } catch (err) {
      clearInterval(progressInterval);
      setErrorMessage(err.message || 'An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const getFormatBadge = (file) => {
    if (!file) return 'FILE';
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  return (
    <section className="hero-section">
      {/* Background Decorative Atmosphere */}
      <div className="hero-glow-top" />
      <div className="hero-glow-right" />
      
      {/* Decorative Floating Badges */}
      <div className="floating-format-badge badge-pos-1 animate-float-slow">
        <span className="badge-pill-pdf">PDF</span>
        <span>→</span>
        <span className="badge-pill-docx">DOCX</span>
      </div>

      <div className="floating-format-badge badge-pos-2 animate-float-reverse">
        <span className="badge-pill-img">PNG</span>
        <span>→</span>
        <span className="badge-pill-webp">WEBP</span>
      </div>

      <div className="floating-format-badge badge-pos-3 animate-float">
        <Layers size={14} color="#4338CA" />
        <span>Lossless Compression</span>
      </div>

      <div className="floating-format-badge badge-pos-4 animate-float-slow">
        <Sparkles size={14} color="#8B5CF6" />
        <span>Neural OCR Engine</span>
      </div>

      <div className="section-container hero-container">
        {/* Top Product Badge */}
        <div className="section-badge animate-fade-in-up">
          <span className="dot" />
          <span>⚡ Smart File Conversion Engine • High Precision v2.5</span>
        </div>

        {/* Hero Title */}
        <h1 className="section-title hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Convert Any File.<br />
          <span className="text-gradient-primary">With Instant Precision.</span>
        </h1>

        {/* Central Conversion Workspace */}
        <div className="workspace-card saas-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Workspace Header Toolbar */}
          <div className="workspace-toolbar">
            <div className="toolbar-controls">
              <div className="toolbar-select-group">
                <CustomSelect 
                  label="Select Conversion Tool"
                  value={action}
                  options={TOOL_OPTIONS}
                  onChange={(val) => {
                    setAction(val);
                    setConvertedResult(null);
                    setErrorMessage('');
                  }}
                />
              </div>

              {action === 'image' && (
                <div className="toolbar-select-group">
                  <CustomSelect 
                    label="Target Format"
                    value={imageFormat}
                    options={IMAGE_FORMATS}
                    onChange={(val) => {
                      setImageFormat(val);
                      setConvertedResult(null);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="toolbar-status-badge">
              {isConverting ? (
                <span className="status-pill status-converting">
                  <Loader2 size={13} className="animate-spin-slow" /> Processing
                </span>
              ) : convertedResult ? (
                <span className="status-pill status-success">
                  <Check size={13} /> Completed
                </span>
              ) : selectedFiles.length > 0 ? (
                <span className="status-pill status-ready">
                  <Zap size={13} /> Ready to Convert
                </span>
              ) : (
                <span className="status-pill status-idle">
                  Idle
                </span>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            multiple={action === 'merge-pdf'}
            style={{ display: 'none' }}
            onChange={onFileInputChange}
          />

          {/* Drag & Drop Upload Zone */}
          <div 
            className={`dropzone-area ${isDragging ? 'dragging' : ''} ${selectedFiles.length > 0 ? 'has-files' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!isConverting) setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={isConverting ? undefined : handleDrop}
            onClick={() => {
              if (!isConverting && selectedFiles.length === 0) {
                fileInputRef.current?.click();
              }
            }}
          >
            {selectedFiles.length === 0 ? (
              <div className="dropzone-empty">
                <div className="upload-icon-circle animate-float">
                  <UploadCloud size={36} color="#4338CA" />
                </div>
                <h3 className="dropzone-heading">
                  {action === 'merge-pdf' ? 'Drag & drop multiple PDFs to merge' : 'Drag & drop your file here'}
                </h3>
                <p className="dropzone-sub">
                  Supports PDF, DOCX, JPG, PNG, WEBP, TXT up to 100MB
                </p>
                <button 
                  type="button" 
                  className="btn-secondary dropzone-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="dropzone-active-files">
                {/* File Preview Card */}
                <div className="file-preview-card">
                  <div className="file-preview-left">
                    <div className="file-badge">
                      {getFormatBadge(selectedFiles[0])}
                    </div>
                    <div className="file-info-text">
                      <div className="file-title">
                        {selectedFiles.length > 1 
                          ? `${selectedFiles.length} files selected for merge` 
                          : selectedFiles[0].name}
                      </div>
                      <div className="file-meta">
                        {selectedFiles.length > 1 
                          ? `${selectedFiles.map(f => f.name).join(', ').substring(0, 45)}...`
                          : formatFileSize(selectedFiles[0].size)}
                      </div>
                    </div>
                  </div>

                  <div className="file-preview-actions">
                    <button 
                      type="button"
                      className="btn-icon-subtle"
                      title="Clear file"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      disabled={isConverting}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Conversion Progress Bar */}
                {isConverting && (
                  <div className="conversion-progress-box">
                    <div className="progress-labels">
                      <span>Processing file with high-speed engine...</span>
                      <span>{conversionProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${conversionProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="error-banner">
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner & Download Section */}
                {convertedResult && (
                  <div className="success-download-box">
                    <div className="success-header">
                      <div className="success-icon-wrap">
                        <Check size={20} color="#10B981" />
                      </div>
                      <div>
                        <div className="success-title">Conversion Finished Successfully!</div>
                        <div className="success-subtitle">
                          {convertedResult.filename} • {convertedResult.size}
                        </div>
                      </div>
                    </div>

                    <div className="download-action-group">
                      <a 
                        href={convertedResult.url} 
                        download={convertedResult.filename}
                        className="btn-primary download-btn"
                      >
                        <Download size={18} />
                        <span>Download Converted File</span>
                      </a>

                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewModalData({
                            url: convertedResult.url,
                            filename: convertedResult.filename,
                            type: convertedResult.type,
                            textContent: convertedResult.textContent
                          });
                          setPreviewModalOpen(true);
                        }}
                        className="btn-secondary preview-btn"
                      >
                        <Eye size={16} />
                        <span>Preview</span>
                      </button>

                      <button 
                        type="button"
                        onClick={handleClear}
                        className="btn-secondary reset-btn"
                        title="Convert another file"
                      >
                        <RefreshCcw size={16} />
                        <span>New File</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons when files selected and not yet converted */}
                {!convertedResult && (
                  <div className="workspace-action-row">
                    <button 
                      type="button"
                      className="btn-primary convert-cta-btn"
                      onClick={handleConvert}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <>
                          <Loader2 size={18} className="animate-spin-slow" />
                          <span>Converting...</span>
                        </>
                      ) : (
                        <>
                          <span>Convert Now</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <button 
                      type="button"
                      className="btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isConverting}
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Workspace Footer Guarantee Pills */}
          <div className="workspace-features-bar">
            <div className="feature-pill">
              <Shield size={14} color="#4338CA" />
              <span>TLS 256-bit Encryption</span>
            </div>
            <div className="feature-pill">
              <Zap size={14} color="#2563EB" />
              <span>Instant Parallel Processing</span>
            </div>
            <div className="feature-pill">
              <Sparkles size={14} color="#8B5CF6" />
              <span>100% Free & Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        previewData={previewModalData}
      />

      <style>{`
        .hero-section {
          position: relative;
          padding-top: max(84px, calc(70px + env(safe-area-inset-top)));
          padding-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow-x: clip;
          width: 100%;
        }

        @media (min-width: 768px) {
          .hero-section {
            padding-top: 90px;
            padding-bottom: 56px;
          }
        }

        .hero-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 8px !important;
          padding-bottom: 24px !important;
        }

        .hero-container .section-badge {
          margin-bottom: 14px;
        }

        .hero-title {
          font-size: clamp(1.9rem, 6vw, 4rem);
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 22px;
          width: 100%;
          max-width: 900px;
        }

        .hero-glow-top {
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: min(800px, 120vw);
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(248, 250, 255, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        .hero-glow-right {
          position: absolute;
          top: 30%;
          right: -100px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(248, 250, 255, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Floating format badges - Desktop only */
        .badge-pos-1 { top: 95px; left: 5%; }
        .badge-pos-2 { top: 105px; right: 5%; }
        .badge-pos-3 { bottom: 120px; left: 3%; }
        .badge-pos-4 { bottom: 130px; right: 3%; }

        @media (max-width: 1120px) {
          .floating-format-badge {
            display: none !important;
          }
        }

        .badge-pill-pdf {
          background: #FEE2E2;
          color: #DC2626;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .badge-pill-docx {
          background: #DBEAFE;
          color: #2563EB;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .badge-pill-img {
          background: #FEF3C7;
          color: #D97706;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .badge-pill-webp {
          background: #EDE9FE;
          color: #7C3AED;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        /* Workspace Card */
        .workspace-card {
          width: 100%;
          max-width: 820px;
          padding: 16px;
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 22px;
          box-shadow: 0 20px 40px -15px rgba(17, 24, 39, 0.08);
          text-align: left;
          overflow: visible !important; /* Prevent clipping custom dropdowns */
        }

        @media (min-width: 481px) {
          .workspace-card {
            padding: 22px;
          }
        }

        @media (min-width: 768px) {
          .workspace-card {
            padding: 28px;
            border-radius: 24px;
          }
        }

        .workspace-toolbar {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--card-border-subtle);
          margin-bottom: 18px;
        }

        @media (min-width: 600px) {
          .workspace-toolbar {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
        }

        .toolbar-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        @media (min-width: 540px) {
          .toolbar-controls {
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }
        }

        .toolbar-select-group {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        .toolbar-status-badge {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
        }

        @media (min-width: 600px) {
          .toolbar-status-badge {
            padding-bottom: 4px;
          }
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-idle {
          background: #F1F5F9;
          color: var(--text-muted);
        }

        .status-ready {
          background: rgba(37, 99, 235, 0.1);
          color: var(--color-secondary);
        }

        .status-converting {
          background: rgba(67, 56, 202, 0.1);
          color: var(--color-primary);
        }

        .status-success {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        /* Dropzone */
        .dropzone-area {
          border: 2px dashed #CBD5E1;
          background: #F8FAFC;
          border-radius: 16px;
          padding: 24px 14px;
          transition: all 0.25s ease;
          position: relative;
          width: 100%;
        }

        @media (min-width: 640px) {
          .dropzone-area {
            border-radius: 18px;
            padding: 36px 24px;
          }
        }

        .dropzone-area:hover {
          border-color: var(--color-secondary);
          background: #F1F5F9;
          cursor: pointer;
        }

        .dropzone-area.dragging {
          border-color: var(--color-primary);
          background: rgba(67, 56, 202, 0.05);
          transform: scale(1.01);
        }

        .dropzone-area.has-files {
          cursor: default;
          background: #FFFFFF;
          border-style: solid;
          border-color: var(--card-border);
          padding: 14px;
        }

        @media (min-width: 640px) {
          .dropzone-area.has-files {
            padding: 24px;
          }
        }

        .dropzone-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .upload-icon-circle {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border: 1px solid rgba(67, 56, 202, 0.15);
        }

        @media (min-width: 640px) {
          .upload-icon-circle {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            margin-bottom: 16px;
          }
        }

        .dropzone-heading {
          font-size: clamp(1.05rem, 3vw, 1.25rem);
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .dropzone-sub {
          font-size: clamp(0.8rem, 2.2vw, 0.9rem);
          color: var(--text-muted);
          margin-bottom: 18px;
          max-width: 380px;
        }

        .dropzone-btn {
          font-size: 0.9rem;
          min-height: 44px;
          padding: 10px 24px;
          width: 100%;
          max-width: 220px;
        }

        @media (min-width: 481px) {
          .dropzone-btn {
            width: auto;
          }
        }

        /* Active Files State */
        .file-preview-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #F8FAFC;
          border: 1px solid var(--card-border);
          border-radius: 14px;
          margin-bottom: 16px;
          gap: 10px;
        }

        .file-preview-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .file-badge {
          background: var(--gradient-primary);
          color: #FFFFFF;
          padding: 6px 9px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .file-info-text {
          min-width: 0;
          flex: 1;
        }

        .file-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-icon-subtle {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .btn-icon-subtle:hover {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* Progress Bar */
        .conversion-progress-box {
          margin-bottom: 16px;
          padding: 12px 14px;
          background: #F1F5F9;
          border-radius: 12px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: #E2E8F0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-electric);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .error-banner {
          padding: 12px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          color: #DC2626;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 16px;
          overflow-wrap: break-word;
        }

        /* Success & Download */
        .success-download-box {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 6px;
        }

        @media (min-width: 640px) {
          .success-download-box {
            padding: 20px;
          }
        }

        .success-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .success-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .success-title {
          font-weight: 700;
          font-size: 1rem;
          color: #166534;
        }

        .success-subtitle {
          font-size: 0.825rem;
          color: #15803D;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .download-action-group {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }

        @media (min-width: 540px) {
          .download-action-group {
            flex-direction: row;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }
        }

        .download-btn {
          width: 100%;
          min-height: 46px;
          padding: 12px 20px;
        }

        @media (min-width: 540px) {
          .download-btn {
            flex: 1 1 200px;
            width: auto;
          }
        }

        .preview-btn, .reset-btn {
          min-height: 44px;
          padding: 10px 18px;
          width: 100%;
        }

        @media (min-width: 540px) {
          .preview-btn, .reset-btn {
            width: auto;
          }
        }

        .workspace-action-row {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }

        @media (min-width: 500px) {
          .workspace-action-row {
            flex-direction: row;
            align-items: center;
            gap: 12px;
          }
        }

        .convert-cta-btn {
          flex: 1;
          min-height: 46px;
          padding: 12px 24px;
          font-size: 0.975rem;
        }

        /* Footer bar of workspace */
        .workspace-features-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 1px solid var(--card-border-subtle);
          flex-wrap: wrap;
          gap: 10px 18px;
        }

        @media (min-width: 640px) {
          .workspace-features-bar {
            justify-content: space-around;
            padding-top: 20px;
            margin-top: 20px;
          }
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </section>
  );
};

export default Hero;