import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Trash2, 
  Star, 
  Inbox, 
  Download, 
  Eye, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  FileCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const QUICK_TOOLS = [
  { tool: 'pdf-to-docx', name: 'PDF to Word (DOCX)', icon: FileText, category: 'PDF' },
  { tool: 'image', imageFormat: 'png', name: 'Image to PNG', icon: Layers, category: 'Image' },
  { tool: 'img-to-pdf', name: 'Image to PDF', icon: FileCheck, category: 'PDF' },
  { tool: 'compress-pdf', name: 'Compress PDF', icon: Zap, category: 'PDF' },
  { tool: 'ocr', name: 'Extract Text (OCR)', icon: Sparkles, category: 'AI Tools' },
  { tool: 'docx-to-pdf', name: 'DOCX to PDF', icon: FileText, category: 'Document' }
];

const DashboardPreview = () => {
  const [conversions, setConversions] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Recent');

  const loadLocalConversions = () => {
    if (!auth.currentUser) {
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      setConversions(history);
    }
  };

  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, `users/${currentUser.uid}/conversions`),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
          const fetched = [];
          querySnapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() });
          });
          setConversions(fetched);
        });
      } else {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        loadLocalConversions();
      }
    });

    window.addEventListener('conversionUpdated', loadLocalConversions);

    return () => {
      window.removeEventListener('conversionUpdated', loadLocalConversions);
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleDelete = async (file) => {
    if (user && file.id) {
      await deleteDoc(doc(db, `users/${user.uid}/conversions`, file.id));
    } else {
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      const newHistory = history.filter(item => item.date !== file.date);
      localStorage.setItem('conversions', JSON.stringify(newHistory));
      setConversions(newHistory);
    }
  };

  const handleFavorite = async (file) => {
    const newStatus = !file.favorite;
    if (user && file.id) {
      await updateDoc(doc(db, `users/${user.uid}/conversions`, file.id), {
        favorite: newStatus
      });
    } else {
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      const newHistory = history.map(item => item.date === file.date ? { ...item, favorite: newStatus } : item);
      localStorage.setItem('conversions', JSON.stringify(newHistory));
      setConversions(newHistory);
    }
  };

  const handlePreview = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      alert('For your privacy and security, converted files are automatically deleted from server memory once downloaded. Preview is available immediately upon conversion.');
    }
  };

  const handleLaunchTool = (tool, imageFormat) => {
    window.dispatchEvent(new CustomEvent('selectTool', { detail: { tool, imageFormat } }));
  };

  const filteredList = activeTab === 'Favorites' 
    ? conversions.filter(c => c.favorite) 
    : conversions;

  return (
    <section id="workspace" className="section-container workspace-section">
      <div style={{ textAlign: 'center' }}>
        <div className="section-badge">
          <span className="dot" />
          <span>Productivity Hub</span>
        </div>
        <h2 className="section-title">
          Conversions Workspace
        </h2>
        <p className="section-subtitle">
          Manage your processed files, access conversion history, and quick-launch specialized tools.
        </p>
      </div>

      <div className="workspace-main-panel saas-card">
        {/* Workspace Sub-Header */}
        <div className="workspace-dashboard-header">
          <div className="dashboard-title-group">
            <h3 className="dashboard-heading">
              {user ? `${user.displayName || user.email.split('@')[0]}'s Workspace` : 'Active Session Workspace'}
            </h3>
            <span className="dashboard-subheading">
              {conversions.length} total conversions tracked • Instant local execution
            </span>
          </div>

          <div className="dashboard-tabs">
            {['Recent', 'Favorites', 'All Tools'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`dashboard-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'Favorites' && <Star size={14} className={activeTab === tab ? 'tab-star-active' : ''} />}
                {tab}
                {tab === 'Recent' && conversions.length > 0 && (
                  <span className="tab-count-pill">{conversions.length}</span>
                )}
                {tab === 'Favorites' && conversions.filter(c => c.favorite).length > 0 && (
                  <span className="tab-count-pill">{conversions.filter(c => c.favorite).length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on Active Tab */}
        <div className="dashboard-content-area">
          {activeTab === 'All Tools' ? (
            <div className="tools-grid-view">
              <div className="tools-grid-header">
                <h4>Quick Launch Tools</h4>
                <p>Click any tool to immediately configure the workspace above.</p>
              </div>

              <div className="tools-card-grid">
                {QUICK_TOOLS.map((t, idx) => {
                  const IconComp = t.icon;
                  return (
                    <div 
                      key={idx} 
                      className="quick-tool-card"
                      onClick={() => handleLaunchTool(t.tool, t.imageFormat)}
                    >
                      <div className="quick-tool-icon">
                        <IconComp size={22} color="#4338CA" />
                      </div>
                      <div className="quick-tool-info">
                        <div className="quick-tool-name">{t.name}</div>
                        <div className="quick-tool-cat">{t.category}</div>
                      </div>
                      <ArrowRight size={16} className="quick-tool-arrow" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-workspace-state">
              <div className="empty-icon-box">
                <Inbox size={42} color="#64748B" />
              </div>
              <h4 className="empty-title">
                {activeTab === 'Favorites' ? 'No favorite conversions yet' : 'No recent conversions found'}
              </h4>
              <p className="empty-desc">
                {activeTab === 'Favorites'
                  ? 'Star any completed conversion from your recent list to pin it here.'
                  : 'Convert documents or images using the tool above to see your history appear here.'}
              </p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '16px' }}
                onClick={() => {
                  const card = document.querySelector('.workspace-card');
                  if (card) {
                    const topOffset = card.getBoundingClientRect().top + window.scrollY - 90;
                    window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <span>Start Converting</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="conversions-table-wrapper">
              <div className="conversions-list">
                {filteredList.map((file, i) => (
                  <div key={file.id || file.date || i} className="conversion-row-card">
                    <div className="row-left">
                      <div className="file-type-icon">
                        <FileText size={20} color="#4338CA" />
                      </div>
                      <div className="file-details">
                        <div className="file-name-row">
                          <span className="file-name" title={file.name}>{file.name}</span>
                          <span className="target-format-pill">to {file.to}</span>
                        </div>
                        <div className="file-meta-row">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span className="meta-time">
                            <Clock size={12} />
                            {new Date(file.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="row-right">
                      <div className="row-status-pill">
                        <CheckCircle size={14} color="#10B981" />
                        <span>Completed</span>
                      </div>

                      <div className="row-actions">
                        {file.url && (
                          <button 
                            className="btn-row-action"
                            title="Preview file"
                            onClick={() => handlePreview(file)}
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        <button 
                          className={`btn-row-action ${file.favorite ? 'favorited' : ''}`}
                          title={file.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
                          onClick={() => handleFavorite(file)}
                        >
                          <Star size={16} fill={file.favorite ? '#F59E0B' : 'none'} color={file.favorite ? '#F59E0B' : 'var(--text-muted)'} />
                        </button>

                        <button 
                          className="btn-row-action delete-action"
                          title="Delete from history"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .workspace-section {
          position: relative;
        }

        .workspace-main-panel {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid var(--card-border);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          padding: 0;
        }

        @media (min-width: 768px) {
          .workspace-main-panel {
            border-radius: 24px;
          }
        }

        .workspace-dashboard-header {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--card-border-subtle);
          background: #FAFBFE;
          gap: 14px;
        }

        @media (min-width: 768px) {
          .workspace-dashboard-header {
            flex-direction: row;
            align-items: center;
            padding: 24px 32px;
            gap: 16px;
          }
        }

        .dashboard-title-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .dashboard-heading {
          font-size: clamp(1.1rem, 2.5vw, 1.25rem);
          font-weight: 700;
          color: var(--text-main);
          overflow-wrap: break-word;
        }

        .dashboard-subheading {
          font-size: 0.825rem;
          color: var(--text-muted);
        }

        .dashboard-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #EEF2F6;
          padding: 4px;
          border-radius: 14px;
          width: 100%;
          overflow-x: auto;
        }

        @media (min-width: 768px) {
          .dashboard-tabs {
            width: auto;
            gap: 6px;
          }
        }

        .dashboard-tab-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
          min-height: 44px;
          padding: 8px 10px;
          border-radius: 10px;
          background: transparent;
          border: none;
          font-family: var(--font-display);
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          .dashboard-tab-btn {
            flex: 0 0 auto;
            min-height: 40px;
            padding: 8px 16px;
            font-size: 0.875rem;
          }
        }

        .dashboard-tab-btn:hover {
          color: var(--text-main);
        }

        .dashboard-tab-btn.active {
          background: #FFFFFF;
          color: var(--color-primary);
          box-shadow: 0 2px 6px rgba(17, 24, 39, 0.06);
        }

        .tab-star-active {
          color: #F59E0B;
          fill: #F59E0B;
        }

        .tab-count-pill {
          background: rgba(67, 56, 202, 0.1);
          color: var(--color-primary);
          font-size: 0.725rem;
          padding: 1px 7px;
          border-radius: 9999px;
        }

        .dashboard-content-area {
          padding: 16px;
          min-height: 320px;
        }

        @media (min-width: 640px) {
          .dashboard-content-area {
            padding: 24px;
          }
        }

        @media (min-width: 768px) {
          .dashboard-content-area {
            padding: 32px;
            min-height: 380px;
          }
        }

        /* Empty state */
        .empty-workspace-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 16px;
        }

        @media (min-width: 768px) {
          .empty-workspace-state {
            padding: 60px 24px;
          }
        }

        .empty-icon-box {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .empty-desc {
          color: var(--text-muted);
          font-size: 0.925rem;
          max-width: 420px;
          line-height: 1.6;
        }

        /* Conversions List */
        .conversions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .conversion-row-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 14px;
          background: #FFFFFF;
          border: 1px solid var(--card-border-subtle);
          border-radius: 16px;
          transition: all 0.2s ease;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .conversion-row-card {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            gap: 16px;
          }
        }

        .conversion-row-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 4px 12px -2px rgba(17, 24, 39, 0.05);
          background: #FAFBFE;
        }

        .row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        @media (min-width: 640px) {
          .row-left {
            gap: 16px;
          }
        }

        .file-type-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-details {
          min-width: 0;
          flex: 1;
        }

        .file-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .file-name {
          font-weight: 600;
          font-size: 0.925rem;
          color: var(--text-main);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
          min-width: 0;
        }

        @media (min-width: 768px) {
          .file-name {
            max-width: 340px;
          }
        }

        .target-format-pill {
          background: rgba(37, 99, 235, 0.08);
          color: var(--color-secondary);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .file-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .meta-time {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .row-right {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--card-border-subtle);
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .row-right {
            padding-top: 0;
            border-top: none;
            justify-content: flex-end;
            gap: 16px;
          }
        }

        .row-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ECFDF5;
          color: #059669;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-row-action {
          min-width: 44px;
          min-height: 44px;
          border-radius: 10px;
          background: #F8FAFC;
          border: 1px solid var(--card-border-subtle);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (min-width: 768px) {
          .btn-row-action {
            min-width: 38px;
            min-height: 38px;
            border-radius: 8px;
          }
        }

        .btn-row-action:hover {
          background: #FFFFFF;
          color: var(--color-primary);
          border-color: var(--card-border);
        }

        .btn-row-action.favorited {
          color: #F59E0B;
        }

        .btn-row-action.delete-action:hover {
          color: #EF4444;
          background: #FEF2F2;
          border-color: #FECACA;
        }

        /* Quick tools in dashboard */
        .tools-grid-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tools-grid-header h4 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .tools-grid-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .tools-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
          gap: 14px;
        }

        .quick-tool-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 64px;
          padding: 14px 16px;
          background: #FFFFFF;
          border: 1px solid var(--card-border);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          min-width: 0;
        }

        .quick-tool-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }

        .quick-tool-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(67, 56, 202, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quick-tool-info {
          flex: 1;
          min-width: 0;
        }

        .quick-tool-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .quick-tool-cat {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        .quick-tool-arrow {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .quick-tool-card:hover .quick-tool-arrow {
          transform: translateX(4px);
          color: var(--color-primary);
        }
      `}</style>
    </section>
  );
};

export default DashboardPreview;