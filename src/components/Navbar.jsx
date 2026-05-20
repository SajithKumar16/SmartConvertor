import React, { useState, useEffect } from 'react';
import { Sparkle, List, X, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className={`dribbble-navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Left Logo Button */}
      <Link to="/" className="logo-btn" onClick={() => window.scrollTo(0, 0)}>
        <img src="/logo.png" alt="Logo" />
      </Link>

      {/* Middle Navigation Links */}
      <div className="dribbble-nav-links">
        {['Features', 'How it Works', 'Workspace'].map((item) => (
          <a 
            key={item} 
            href={`/#${item.toLowerCase().replace(/ /g, '-')}`} 
            className="dribbble-nav-link"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right Action Button */}
      <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="dribbble-nav-links">
        {user ? (
          <>
            <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, marginRight: '8px' }}>
              <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', position: 'relative', top: '-1px', color: 'var(--text-muted)' }} />
              {user.email ? user.email.split('@')[0] : 'User'}
            </div>
            <button 
              onClick={handleSignOut}
              className="action-capsule-btn outline"
              data-hover-text="Goodbye!"
            >
              <span className="action-text">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="action-capsule-btn outline" 
              data-hover-text="Welcome Back"
            >
              <span className="action-text">Sign In</span>
            </Link>
            <Link 
              to="/signup" 
              className="action-capsule-btn" 
              data-hover-text="Join Us"
            >
              <span className="action-text">Get Started</span>
            </Link>
          </>
        )}
      </div>
      
      {/* Mobile Toggle */}
      <button 
        style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'block' }}
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
      </button>

      <style>{`
        @media (min-width: 768px) {
          .dribbble-nav-links {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
