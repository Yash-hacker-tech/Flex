import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="fade-in" style={{ zIndex: 1 }}>
        <div style={{ 
          fontSize: '10rem', 
          fontWeight: 900,
          fontFamily: 'var(--font-display)', 
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 10,
          filter: 'drop-shadow(0 0 40px rgba(108,99,255,0.4))'
        }}>
          404
        </div>
        <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-display)', marginBottom: 16 }}>Lost in empty space</h1>
        <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: '1.1rem', maxWidth: 450, margin: '0 auto 32px' }}>
          The page you're looking for has drifted into the void. Let's get you back to familiar territory.
        </p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 30 }}>
          🚀 Return Home
        </Link>
      </div>
    </div>
  );
}
