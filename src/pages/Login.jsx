import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        console.error("Firebase Login Error:", err);
        let msg = 'Failed to sign in. Please verify your credentials.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Access temporarily disabled due to many failed attempts. Try again later.';
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.trim()) {
      setError('Please enter your email address first so we can send you a password reset link.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg(`Password reset email sent to ${email.trim()}! Please check your inbox and spam folder.`);
    } catch (err) {
      console.error("Password Reset Error:", err);
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait before trying again.';
      }
      setError(msg);
    } finally {
      setResetLoading(false);
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your SmartConvert account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="auth-success-alert">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="auth-form">
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
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              <a 
                href="#" 
                className="auth-forgot-link" 
                onClick={handleForgotPassword}
              >
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </a>
            </div>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-field-icon" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch-text">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-switch-link">
            Create an account
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

        .auth-success-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
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

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-forgot-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-secondary);
          text-decoration: none;
        }

        .auth-forgot-link:hover {
          text-decoration: underline;
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

export default Login;