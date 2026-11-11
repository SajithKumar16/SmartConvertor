import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ArrowRight, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navWrapperRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on click outside or Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e) => {
      if (navWrapperRef.current && !navWrapperRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Workspace', href: '/#workspace' },
  ];

  const handleLinkClick = (e, href) => {
    if (href === '/') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper" ref={navWrapperRef}>
      <nav className={`navbar-pill ${scrolled ? 'scrolled' : ''}`} aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="navbar-brand" 
          onClick={(e) => handleLinkClick(e, '/')}
        >
          <img src="/logo.png" alt="SmartConvert" className="brand-logo-img" />
          <span className="brand-text">
            Smart<span className="brand-accent">Convert</span>
          </span>
        </Link>

        {/* Center Desktop/Tablet Links */}
        <div className="navbar-links">
          {navLinks.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="nav-link"
              onClick={(e) => handleLinkClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Desktop/Tablet Auth Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={14} color="#4338CA" />
                </div>
                <span className="user-name">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'User')}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="btn-signout"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-login-btn">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary nav-cta-btn">
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in-up" role="dialog" aria-label="Mobile Navigation Menu">
          <div className="mobile-links">
            {navLinks.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, item.href)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mobile-auth">
            {user ? (
              <div className="mobile-user-row">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={14} color="#4338CA" />
                  </div>
                  <span className="user-name">{user.email}</span>
                </div>
                <button onClick={handleSignOut} className="btn-secondary" style={{ width: '100%' }}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link 
                  to="/login" 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar-wrapper {
          position: fixed;
          top: max(12px, env(safe-area-inset-top));
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left));
        }

        @media (min-width: 768px) {
          .navbar-wrapper {
            top: max(18px, env(safe-area-inset-top));
            padding: 0 16px;
          }
        }

        .navbar-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.32) 50%, rgba(255, 255, 255, 0.48) 100%);
          backdrop-filter: blur(24px) saturate(210%);
          -webkit-backdrop-filter: blur(24px) saturate(210%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-top-color: rgba(255, 255, 255, 0.95);
          border-bottom-color: rgba(255, 255, 255, 0.45);
          border-radius: 9999px;
          padding: 6px 8px 6px 14px;
          width: 100%;
          max-width: 960px;
          gap: 12px;
          box-shadow: 
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.35),
            inset 0 0 14px 0 rgba(255, 255, 255, 0.25),
            0 16px 40px -10px rgba(37, 99, 235, 0.12),
            0 4px 12px -2px rgba(17, 24, 39, 0.05);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 768px) {
          .navbar-pill {
            padding: 8px 12px 8px 18px;
          }
        }

        .navbar-pill.scrolled {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.52) 100%);
          backdrop-filter: blur(28px) saturate(220%);
          -webkit-backdrop-filter: blur(28px) saturate(220%);
          border-color: rgba(255, 255, 255, 0.9);
          border-top-color: #FFFFFF;
          box-shadow: 
            inset 0 1.5px 1px 0 #FFFFFF,
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.4),
            0 20px 48px -10px rgba(37, 99, 235, 0.16),
            0 6px 16px -2px rgba(17, 24, 39, 0.07);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-main);
          flex-shrink: 0;
        }

        .brand-logo-img {
          width: 30px;
          height: 30px;
          object-fit: contain;
          display: block;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 768px) {
          .brand-logo-img {
            width: 32px;
            height: 32px;
          }
        }

        .navbar-brand:hover .brand-logo-img {
          transform: rotate(8deg) scale(1.1);
        }

        .brand-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(1rem, 3vw, 1.15rem);
          letter-spacing: -0.02em;
          color: var(--text-main);
          white-space: nowrap;
        }

        .brand-accent {
          background: var(--gradient-electric);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .navbar-links {
          display: none;
          align-items: center;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .navbar-links {
            display: flex;
          }
        }

        @media (min-width: 1024px) {
          .navbar-links {
            gap: 28px;
          }
        }

        .nav-link {
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          position: relative;
          padding: 6px 2px;
          transition: color 0.2s ease;
          white-space: nowrap;
        }

        @media (min-width: 1024px) {
          .nav-link {
            font-size: 0.925rem;
          }
        }

        .nav-link:hover {
          color: var(--color-primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 20px;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        .navbar-actions {
          display: none;
          align-items: center;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .navbar-actions {
            display: flex;
          }
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (min-width: 1024px) {
          .auth-buttons {
            gap: 10px;
          }
        }

        .nav-login-btn {
          text-decoration: none;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-main);
          padding: 8px 12px;
          border-radius: 9999px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        @media (min-width: 1024px) {
          .nav-login-btn {
            font-size: 0.925rem;
            padding: 8px 16px;
          }
        }

        .nav-login-btn:hover {
          background: rgba(241, 245, 249, 0.8);
          color: var(--color-primary);
        }

        .nav-cta-btn {
          min-height: 40px;
          padding: 8px 14px;
          font-size: 0.85rem;
        }

        @media (min-width: 1024px) {
          .nav-cta-btn {
            padding: 9px 18px;
            font-size: 0.875rem;
          }
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.85);
          padding: 4px 8px 4px 6px;
          border-radius: 9999px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(67, 56, 202, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-signout {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          min-height: 32px;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .btn-signout:hover {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .mobile-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-toggle-btn:hover {
          background: #FFFFFF;
          color: var(--color-primary);
        }

        @media (min-width: 768px) {
          .mobile-toggle-btn {
            display: none;
          }
        }

        .mobile-drawer {
          width: 100%;
          max-width: 960px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.78) 100%);
          backdrop-filter: blur(28px) saturate(210%);
          -webkit-backdrop-filter: blur(28px) saturate(210%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-top-color: #FFFFFF;
          border-radius: 24px;
          padding: 20px;
          margin-top: 10px;
          box-shadow: 
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
            0 20px 45px -10px rgba(37, 99, 235, 0.16);
          max-height: calc(100vh - 90px);
          overflow-y: auto;
        }

        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .mobile-nav-link {
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          padding: 10px 14px;
          min-height: 44px;
          display: flex;
          align-items: center;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .mobile-nav-link:hover {
          background: rgba(67, 56, 202, 0.08);
          color: var(--color-primary);
        }

        .mobile-auth {
          padding-top: 16px;
          border-top: 1px solid var(--card-border);
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mobile-user-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mobile-user-row .user-name {
          max-width: 100%;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
