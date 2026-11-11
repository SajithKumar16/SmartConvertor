import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (email && password && name) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        navigate('/');
      } catch (err) {
        console.error("Firebase Sign Up Error:", err);
        let msg = 'Failed to create account. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email address already exists.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please choose a stronger password.';
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="auth-page-wrapper">
      <div className="auth-glow" />

      {/* Back to Home Link */}
      <Link to="/" className="auth-back-link">
        <ArrowLeft size={16} />
        <span>Back to SmartConvert</span>
      </Link>

      <div className="auth-card saas-card animate-fade-in-up">
        {/* Header */}
        <div className="auth-header">
          <img src="/logo.png" alt="SmartConvert" className="auth-logo-img" />
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join SmartConvert for unified file management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <User size={18} className="auth-field-icon" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-field-icon" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-field-icon" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="auth-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary auth-submit-btn"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        .auth-page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: max(96px, calc(80px + env(safe-area-inset-top))) max(16px, env(safe-area-inset-right)) 40px max(16px, env(safe-area-inset-left));
          position: relative;
          overflow-x: clip;
          width: 100%;
        }

        .auth-glow {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: min(500px, 100vw);
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(248, 250, 255, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        .auth-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.2s ease, transform 0.2s ease;
          position: relative;
          z-index: 10;
        }

        .auth-back-link:hover {
          color: var(--color-primary);
          transform: translateX(-3px);
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 24px;
          padding: 40px 36px;
          border: 1px solid var(--card-border);
          box-shadow: var(--shadow-xl);
          position: relative;
          z-index: 10;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 28px 22px;
          }
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-logo-img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          display: block;
          margin-bottom: 16px;
        }

        .auth-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 0.925rem;
          color: var(--text-muted);
        }

        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .auth-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          background: #F8FAFC;
          color: var(--text-main);
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 13px;
          font-size: 1rem;
          margin-top: 6px;
        }

        .auth-switch-text {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-switch-link {
          color: var(--color-primary);
          font-weight: 700;
          text-decoration: none;
        }

        .auth-switch-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default SignUp;