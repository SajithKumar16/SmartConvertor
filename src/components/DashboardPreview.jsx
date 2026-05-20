import React, { useState, useEffect } from 'react';
import { File, CheckCircle, ChevronDown, MoreHorizontal, Inbox, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const DashboardPreview = () => {
  const [conversions, setConversions] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Recent');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const loadLocalConversions = () => {
    // Only load local if no user is signed in
    if (!auth.currentUser) {
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      setConversions(history);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch from Firestore
        const q = query(
          collection(db, `users/${currentUser.uid}/conversions`),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
          const fetchedConversions = [];
          querySnapshot.forEach((doc) => {
            fetchedConversions.push({ id: doc.id, ...doc.data() });
          });
          setConversions(fetchedConversions);
        });
      } else {
        // Fetch from LocalStorage
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
    if (user) {
      if (file.id) {
        await deleteDoc(doc(db, `users/${user.uid}/conversions`, file.id));
      }
    } else {
      const history = JSON.parse(localStorage.getItem('conversions') || '[]');
      const newHistory = history.filter(item => item.date !== file.date);
      localStorage.setItem('conversions', JSON.stringify(newHistory));
      setConversions(newHistory);
    }
  };

  const handleFavorite = async (file) => {
    const newStatus = !file.favorite;
    if (user) {
      if (file.id) {
        await updateDoc(doc(db, `users/${user.uid}/conversions`, file.id), {
          favorite: newStatus
        });
      }
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
      alert('For your privacy and security, converted files are automatically deleted from our servers immediately after your session. Preview is not available for past conversions.');
    }
  };

  const renderConversionList = (list) => {
    if (list.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
          <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No recent conversions found.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Use the drag-and-drop tool above to get started!</p>
        </div>
      );
    }

    return list.map((file, i) => (
      <div key={file.id || file.date || i} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--ui-card)',
        borderRadius: '12px',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <File size={24} color={file.favorite ? '#eab308' : 'var(--btn-primary)'} />
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {file.name}
              {file.favorite && <Star size={14} fill="#eab308" color="#eab308" />}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{file.size} • to {file.to} • {new Date(file.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.9rem' }}>
            <CheckCircle size={16} /> {file.status}
          </div>
          
          <div style={{ position: 'relative' }}>
            <MoreHorizontal 
              size={20} 
              color="var(--text-muted)" 
              style={{ cursor: 'pointer' }} 
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === file.date ? null : file.date);
              }}
            />
            {activeDropdown === file.date && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--ui-card)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 10,
                minWidth: '160px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--section-bg)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  onClick={() => { handlePreview(file); setActiveDropdown(null); }}
                >
                  Preview
                </div>
                <div 
                  style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--section-bg)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  onClick={() => { handleFavorite(file); setActiveDropdown(null); }}
                >
                  {file.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
                </div>
                <div 
                  style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  onClick={() => { handleDelete(file); setActiveDropdown(null); }}
                >
                  Delete
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section id="workspace" className="section-container">
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 className="section-title">Your Conversions Workspace</h2>
        <p className="section-subtitle">A live view of your locally processed files.</p>
      </div>

      <div className="glass-panel" style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(217, 230, 234, 0.8), 0 0 0 1px var(--card-border)',
        borderRadius: '16px'
      }}>
        {/* Mock Browser Header */}
        <div style={{
          background: 'var(--section-bg)',
          padding: '12px 24px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          gap: '8px'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
        </div>

        {/* Dashboard Content */}
        <div style={{ display: 'flex', minHeight: '500px', background: 'var(--card-bg)' }}>
          {/* Sidebar */}
          <div style={{
            width: '240px',
            borderRight: '1px solid var(--card-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--section-bg)'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Tools</div>
            {['All Tools', 'Recent', 'Favorites'].map((item, i) => (
              <div key={i} 
                onClick={() => setActiveTab(item)}
                style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: activeTab === item ? 'var(--card-border)' : 'transparent',
                color: activeTab === item ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                {item}
              </div>
            ))}
          </div>

          {/* Main Area */}
          <div style={{ flex: 1, padding: '32px', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                {user ? `${user.email ? user.email.split('@')[0] : user.displayName || 'User'}'s ${activeTab}` : `Your ${activeTab}`}
              </h3>
              {!user && (
                <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Sign In
                </Link>
              )}
            </div>

            {/* List Content Conditional */}
            {activeTab === 'Recent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {renderConversionList(conversions)}
              </div>
            )}

            {activeTab === 'Favorites' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {renderConversionList(conversions.filter(c => c.favorite))}
              </div>
            )}

            {activeTab === 'All Tools' && (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
                <div style={{ background: 'var(--card-border)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <File size={32} color="var(--text-main)" />
                </div>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 600 }}>Explore All Tools</p>
                <p style={{ fontSize: '0.95rem' }}>Scroll down to the Supported Formats section to see all available tools.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
