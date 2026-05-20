import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, ArrowRight, Loader2, ChevronDown, Check } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CustomDropdown = ({ value, options, onChange, width = 'auto' }) => {
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

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width, textAlign: 'left' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 20px',
          borderRadius: '9999px',
          border: isOpen ? '1px solid var(--btn-primary)' : '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: isOpen ? '0 0 0 3px rgba(77, 168, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
      >
        <span style={{ fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{selectedOption.label}</span>
        <ChevronDown 
          size={18} 
          style={{ 
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          background: 'var(--ui-card)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '100%',
          width: 'max-content',
          padding: '8px 0',
          animation: 'fade-in-up 0.2s ease forwards'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                background: value === opt.value ? 'rgba(77, 168, 255, 0.1)' : 'transparent',
                color: value === opt.value ? 'var(--btn-primary)' : 'var(--text-main)',
                fontWeight: value === opt.value ? 600 : 500,
                transition: 'background 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.background = 'var(--section-bg)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
              {value === opt.value && <Check size={16} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [action, setAction] = useState('image'); // default
  const [imageFormat, setImageFormat] = useState('png');
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    setIsConverting(true);
    const formData = new FormData();
    
    // Some endpoints take multiple files
    if (action === 'merge-pdf') {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else {
      formData.append('file', files[0]);
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

      if (!response.ok) {
        let errorMsg = 'Failed to convert file.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch(e) {}
        alert(errorMsg);
        setIsConverting(false);
        return;
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'converted_file';
      if (contentDisposition && contentDisposition.includes('filename="')) {
        filename = contentDisposition.split('filename="')[1].split('"')[0];
      }
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const previewUrl = response.headers.get('X-Preview-URL');

      // Save to local storage for Dashboard fallback
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      let displayTarget = action.toUpperCase();
      if (action === 'image') displayTarget = imageFormat.toUpperCase();
      else if (action.includes('-to-')) displayTarget = action.split('-to-')[1].toUpperCase();
      
      const conversionData = {
        name: files.length > 1 ? `${files.length} files merged` : files[0].name,
        to: displayTarget,
        size: files.length > 1 ? 'Multiple' : (files[0].size / (1024 * 1024)).toFixed(1) + ' MB',
        status: 'Completed',
        date: new Date().toISOString(),
        url: previewUrl || ''
      };

      history.unshift(conversionData);
      localStorage.setItem('conversions', JSON.stringify(history.slice(0, 10)));
      window.dispatchEvent(new Event('conversionUpdated')); // Notify Dashboard
      
      // Save to Firestore if user is logged in (fire and forget)
      if (auth.currentUser) {
        addDoc(collection(db, `users/${auth.currentUser.uid}/conversions`), {
          ...conversionData,
          timestamp: serverTimestamp()
        }).catch(dbError => console.error("Error adding document: ", dbError));
      }

    } catch (error) {
      console.error('Error during conversion:', error);
      alert('An error occurred while converting the file.');
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <section style={{
      position: 'relative',
      paddingTop: '160px',
      paddingBottom: '100px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'var(--accent-blob)',
        zIndex: -1,
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.6
      }}></div>

      <div className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: 0 }}>
        
        <div className="animate-fade-in-up" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 16px', 
          background: 'var(--ui-card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '999px', 
          marginBottom: '24px', 
          color: 'var(--btn-primary)', 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          letterSpacing: '0.5px' 
        }}>
          <span style={{ display: 'flex', height: '8px', width: '8px', position: 'relative' }}>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: 'var(--btn-primary)' }}></span>
          </span>
          SMART AI ENGINE v2.0 LIVE
        </div>

        <h1 className="section-title animate-fade-in-up" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '24px', animationDelay: '0.1s' }}>
          Convert Anything.<br/>
          <span className="text-gradient">Instantly.</span>
        </h1>
        
        <p className="section-subtitle animate-fade-in-up" style={{ fontSize: '1.25rem', marginBottom: '48px', animationDelay: '0.2s' }}>
          The ultimate AI-powered universal file transformation toolkit. Secure, blazing-fast, and designed for modern workflows.
        </p>

        {/* Action Selector */}
        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 100, marginBottom: '24px', animationDelay: '0.25s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontWeight: 600 }}>Tool:</label>
          <CustomDropdown 
            value={action} 
            onChange={(val) => setAction(val)}
            options={[
              { value: 'image', label: 'Convert Image' },
              { value: 'img-to-pdf', label: 'Image to PDF' },
              { value: 'pdf-to-docx', label: 'PDF to DOCX' },
              { value: 'docx-to-pdf', label: 'DOCX to PDF' },
              { value: 'txt-to-pdf', label: 'TXT to PDF' },
              { value: 'compress-pdf', label: 'Compress PDF' },
              { value: 'merge-pdf', label: 'Merge PDF' },
              { value: 'split-pdf', label: 'Split PDF' },
              { value: 'ocr', label: 'OCR (Extract Text)' }
            ]}
          />

          {action === 'image' && (
            <CustomDropdown 
              value={imageFormat} 
              onChange={(val) => setImageFormat(val)}
              options={[
                { value: 'png', label: 'to PNG' },
                { value: 'jpg', label: 'to JPG' },
                { value: 'webp', label: 'to WEBP' }
              ]}
            />
          )}
        </div>

        {/* Drag and Drop Area */}
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple={action === 'merge-pdf'}
          style={{ display: 'none' }} 
          onChange={(e) => handleFiles(e.target.files)} 
        />
        <div 
          className="glass-panel animate-fade-in-up" 
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '48px 24px',
            border: isDragging ? '2px dashed var(--btn-primary)' : '2px dashed var(--card-border)',
            background: isDragging ? 'var(--ui-card)' : 'var(--card-bg)',
            transition: 'all 0.3s ease',
            cursor: isConverting ? 'not-allowed' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.3s',
            opacity: isConverting ? 0.7 : 1
          }}
          onDragOver={(e) => { e.preventDefault(); if (!isConverting) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={isConverting ? undefined : onDrop}
          onClick={() => {
            if (!isConverting) fileInputRef.current?.click();
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={isConverting ? "" : "animate-float"} style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'var(--btn-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(77, 168, 255, 0.3)'
            }}>
              {isConverting ? <Loader2 size={40} color="white" className="animate-spin-slow" /> : <UploadCloud size={40} color="white" />}
            </div>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-main)' }}>
              {isConverting ? 'Converting...' : (action === 'merge-pdf' ? 'Drag & Drop MULTIPLE files here' : 'Drag & Drop your file here')}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              {isConverting ? 'Please wait while we process your file via Python Engine' : 'Python Native Conversions Enabled'}
            </p>
            
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isConverting}>
              {isConverting ? 'Processing' : 'Browse Files'} {!isConverting && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
