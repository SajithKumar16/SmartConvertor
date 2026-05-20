import React, { useState } from 'react';
import { Sparkle, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        console.error("Firebase Login Error:", err);
        setError(err.message || 'Failed to log in.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Accent Blob */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'var(--accent-blob)',
        zIndex: -1,
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.6
      }}></div>

      <div className="glass-panel animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '48px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--btn-primary)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Sparkle color="white" size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginBottom: '8px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to SmartConvert</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Password</label>
              <a href="#" style={{ color: 'var(--btn-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '8px' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--btn-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
