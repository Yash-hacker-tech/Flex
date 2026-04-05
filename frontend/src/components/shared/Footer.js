import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer bg-bg2 py-10 border-t border-border mt-auto">
      <div className="container-sm">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 20 }}>
          
          <div style={{ flex: '1 1 250px' }}>
            <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 800, textDecoration: 'none', color: 'var(--text)' }}>
              F<span style={{ color: 'var(--accent)' }}>le</span>X
            </Link>
            <p className="mt-4" style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 300 }}>
              The premium, AI-powered freelancing platform. Connect with top talent, manage projects effortlessly, and get paid securely.
            </p>
            <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
              {/* Mock Social Icons */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', cursor: 'pointer', transition: '0.3s' }} className="hover:bg-accent hover:text-white">𝕏</div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', cursor: 'pointer', transition: '0.3s' }} className="hover:bg-accent hover:text-white">in</div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', cursor: 'pointer', transition: '0.3s' }} className="hover:bg-accent hover:text-white">IG</div>
            </div>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 16 }}>For Clients</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <Link to="/post-project" style={{ color: 'var(--text2)', textDecoration: 'none' }} className="hover:text-accent transition-colors">Post a Project</Link>
              <Link to="/freelancers" style={{ color: 'var(--text2)', textDecoration: 'none' }} className="hover:text-accent transition-colors">Find Talent</Link>
              <span style={{ color: 'var(--text2)', cursor: 'pointer' }} className="hover:text-accent transition-colors">Enterprise Plan</span>
            </div>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 16 }}>For Freelancers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <Link to="/projects" style={{ color: 'var(--text2)', textDecoration: 'none' }} className="hover:text-accent transition-colors">Find Work</Link>
              <Link to="/ai-matches" style={{ color: 'var(--text2)', textDecoration: 'none' }} className="hover:text-accent transition-colors">AI Recommendations</Link>
              <span style={{ color: 'var(--text2)', cursor: 'pointer' }} className="hover:text-accent transition-colors">Success Stories</span>
            </div>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text2)', cursor: 'pointer' }} className="hover:text-accent transition-colors">Help & Support</span>
              <span style={{ color: 'var(--text2)', cursor: 'pointer' }} className="hover:text-accent transition-colors">Trust & Safety</span>
              <span style={{ color: 'var(--text2)', cursor: 'pointer' }} className="hover:text-accent transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, color: 'var(--text3)', fontSize: '0.8rem' }}>
          <div>© {new Date().getFullYear()} FleX. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 15 }}>
            <span style={{ cursor: 'pointer' }} className="hover:text-text transition-colors">Privacy Policy</span>
            <span style={{ cursor: 'pointer' }} className="hover:text-text transition-colors">Cookie Settings</span>
            <span style={{ cursor: 'pointer' }} className="hover:text-text transition-colors">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
