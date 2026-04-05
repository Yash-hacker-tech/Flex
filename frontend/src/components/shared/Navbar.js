import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: 65,
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left Side: Logo & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            className="mobile-only" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff',
              boxShadow: '0 0 20px rgba(108,99,255,0.4)',
            }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>
              Fle<span style={{ color: 'var(--accent2)' }}>X</span>
            </span>
          </Link>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-only { display: block !important; }
            .desktop-only { display: none !important; }
          }
        `}</style>

        {/* Center nav links (Desktop) */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/projects', label: 'Find Work' },
            { to: '/freelancers', label: 'Hire Talent' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 16px', borderRadius: 8,
              color: isActive(to) ? 'var(--accent2)' : 'var(--text2)',
              fontWeight: 500, fontSize: '0.9rem',
              background: isActive(to) ? 'rgba(108,99,255,0.1)' : 'transparent',
              transition: 'var(--transition)',
            }}>{label}</Link>
          ))}
          {user?.role === 'freelancer' && (
            <Link to="/ai-recommendations" style={{
              padding: '6px 16px', borderRadius: 8,
              color: isActive('/ai-recommendations') ? 'var(--accent2)' : 'var(--text2)',
              fontWeight: 500, fontSize: '0.9rem',
              background: isActive('/ai-recommendations') ? 'rgba(108,99,255,0.1)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: '0.8rem' }}>✨</span> AI Jobs
            </Link>
          )}
        </div>

        {/* Right side (Desktop & some Mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <Link to="/messages" className="btn btn-ghost btn-sm desktop-only" style={{ gap: 6 }}>
                💬 Messages
              </Link>
              {user.role === 'client' && (
                <Link to="/post-project" className="btn btn-primary btn-sm desktop-only">
                  + Post Project
                </Link>
              )}
              {/* User dropdown Desktop */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg3)', border: '1px solid var(--border2)',
                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: 'var(--text)',
                  }}
                >
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : user.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <span className="desktop-only" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                  <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>▼</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--bg2)', border: '1px solid var(--border2)',
                      borderRadius: 12, padding: 8, minWidth: 200, zIndex: 100,
                      boxShadow: 'var(--shadow)',
                    }}>
                      {[
                        { to: '/dashboard', label: '📊 Dashboard' },
                        { to: '/profile', label: '👤 My Profile' },
                        { to: '/proposals', label: '📝 Proposals' },
                        { to: '/payments', label: '💳 Payments' },
                        { to: '/messages', label: '💬 Messages' },
                      ].map(({ to, label }) => (
                        <Link key={to} to={to}
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'block', padding: '9px 14px', borderRadius: 8,
                            color: 'var(--text2)', fontSize: '0.88rem', fontWeight: 500,
                            transition: 'var(--transition)',
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
                        >{label}</Link>
                      ))}
                      <div className="divider" style={{ margin: '6px 0' }} />
                      <button onClick={handleLogout} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 14px', borderRadius: 8,
                        color: 'var(--red)', fontSize: '0.88rem', fontWeight: 500,
                        background: 'transparent', cursor: 'pointer', border: 'none',
                        transition: 'var(--transition)',
                      }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >🚪 Sign Out</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute', top: 65, left: 0, right: 0,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: 16, zIndex: 199, display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }} className="mobile-only">
          <Link to="/projects" onClick={() => setMobileMenuOpen(false)} style={{ padding: 12, borderRadius: 8, background: 'var(--bg3)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Find Work</Link>
          <Link to="/freelancers" onClick={() => setMobileMenuOpen(false)} style={{ padding: 12, borderRadius: 8, background: 'var(--bg3)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Hire Talent</Link>
          {user && user.role === 'client' && (
            <Link to="/post-project" onClick={() => setMobileMenuOpen(false)} style={{ padding: 12, borderRadius: 8, background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)', fontWeight: 600, textDecoration: 'none' }}>+ Post Project</Link>
          )}
          {user && user.role === 'freelancer' && (
            <Link to="/ai-recommendations" onClick={() => setMobileMenuOpen(false)} style={{ padding: 12, borderRadius: 8, background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)', fontWeight: 600, textDecoration: 'none' }}>✨ AI Recommendations</Link>
          )}
        </div>
      )}
    </nav>
  );
}
