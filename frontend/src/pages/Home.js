import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: 50, suffix: 'K+', label: 'Freelancers' },
  { value: 12, suffix: 'K+', label: 'Projects Posted' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { value: 2, prefix: '₹', suffix: 'Cr+', label: 'Paid to Freelancers' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Matching', desc: 'Gemini AI analyzes 50+ signals to find freelancers with 80%+ accuracy. Explainable AI shows you exactly why each match was made.', badge: 'Gemini AI', color: 'var(--accent)' },
  { icon: '🔒', title: 'Escrow Protection', desc: 'Funds are held securely in escrow via Razorpay. Payment released only when you approve milestones. Integrated fraud detection for every transaction.', badge: 'Secure', color: 'var(--green)' },
  { icon: '⚡', title: 'Real-Time Chat', desc: 'WebSocket-powered messaging with <100ms latency. Share files up to 100MB, search history, and collaborate seamlessly.', badge: 'Live', color: 'var(--accent3)' },
  { icon: '📊', title: 'Milestone Payments', desc: 'Break projects into milestones. Fund escrow per milestone, approve deliverables, and release payment instantly via Razorpay.', badge: 'Razorpay', color: 'var(--gold)' },
  { icon: '⭐', title: 'Verified Reviews', desc: 'Mutual rating system with weighted averages (recent = higher weight). Skill-specific breakdowns for granular reputation tracking.', badge: 'Trusted', color: 'var(--orange)' },
  { icon: '✉️', title: 'OTP Verification', desc: 'Secure email OTP verification on registration ensures every account is genuine. No spam, no bots — only real professionals.', badge: 'Secure', color: 'var(--accent2)' },
];

const CATEGORIES = [
  { icon: '💻', name: 'Web Development', count: '2.1K projects' },
  { icon: '📱', name: 'Mobile Apps', count: '890 projects' },
  { icon: '🎨', name: 'UI/UX Design', count: '1.4K projects' },
  { icon: '📝', name: 'Content Writing', count: '760 projects' },
  { icon: '📈', name: 'Digital Marketing', count: '540 projects' },
  { icon: '🤖', name: 'AI & ML', count: '430 projects' },
  { icon: '🎬', name: 'Video & Audio', count: '320 projects' },
  { icon: '💰', name: 'Finance', count: '280 projects' },
];

// Animated Number Component
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalMiliseconds = 1500;
    let incrementTime = (totalMiliseconds / end);

    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue}{suffix}</span>;
}

export default function Home() {
  const { user } = useAuth();
  
  // Mouse parallax effect for hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div style={{ overflow: 'hidden' }} onMouseMove={handleMouseMove}>
      {/* Hero */}
      <section style={{ padding: '120px 0 100px', position: 'relative', textAlign: 'center' }}>
        
        {/* Animated Mesh Gradient Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
            top: '-20%', left: '-10%', filter: 'blur(60px)',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`, transition: 'transform 0.1s ease-out'
          }} />
          <div style={{ 
            position: 'absolute', width: '50vw', height: '50vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 60%)',
            bottom: '-10%', right: '-5%', filter: 'blur(60px)',
            transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`, transition: 'transform 0.1s ease-out'
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fade-in">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)',
              borderRadius: 30, padding: '8px 20px', marginBottom: 32,
              fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600,
              boxShadow: '0 0 20px rgba(66,133,244,0.2)',
              animation: 'pulse 3s infinite'
            }}>
              ✨ Powered by Gemini AI — Intelligent Freelancing
            </div>
            
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 20px rgba(66,133,244,0.1); }
                50% { box-shadow: 0 0 35px rgba(66,133,244,0.4); }
                100% { box-shadow: 0 0 20px rgba(66,133,244,0.1); }
              }
              @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
              }
            `}</style>
            
            <h1 style={{
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900, lineHeight: 1.05, marginBottom: 24,
              letterSpacing: '-1px'
            }}>
              The smarter way to<br />
              <span style={{
                background: 'linear-gradient(135deg, #6c63ff, #38bdf8, #a78bfa)',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>hire & get hired</span>
            </h1>
            
            <p style={{
              fontSize: '1.25rem', color: 'var(--text2)', maxWidth: 640,
              margin: '0 auto 48px', lineHeight: 1.7,
            }}>
              FleX uses Gemini AI to match you with the perfect freelancer or project — cutting hiring time by up to 70%. Payments secured by Razorpay.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 30 }}>Go to Dashboard →</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 30 }}>Start for Free →</Link>
                  <Link to="/projects" className="btn btn-secondary btn-lg" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 30 }}>Browse Projects</Link>
                </>
              )}
            </div>
          </div>

          {/* Animated Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20,
            marginTop: 90, maxWidth: 800, marginInline: 'auto',
            background: 'var(--bg2)', padding: '30px 20px', borderRadius: 24,
            border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'fadeIn 1s ease 0.3s both'
          }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: 'var(--accent2)', background: 'linear-gradient(135deg, var(--accent2), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <AnimatedNumber value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(108,99,255,0.03)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(20px, 4vw, 48px)', flexWrap: 'wrap' }}>
          {[
            { label: 'Gemini AI Matching', icon: '✨' },
            { label: 'Razorpay Secured', icon: '🛡️' },
            { label: 'OTP Verified', icon: '✉️' },
            { label: 'PCI Compliant', icon: '🔒' },
            { label: '24/7 Support', icon: '🎧' },
          ].map(b => (
             <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>
              <span style={{ fontSize: '1.2rem' }}>{b.icon}</span>{b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p style={{ color: 'var(--text2)' }}>Explore top skills and hire the best talent</p>
            </div>
            <Link to="/projects" className="btn btn-ghost">View All Categories →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/projects?category=${cat.name.toLowerCase().replace(/ /g, '_')}`}>
                <div className="card card-hover" style={{ padding: 24, cursor: 'pointer', transition: '0.3s', borderRadius: 20 }}>
                  <div style={{ 
                    fontSize: '2rem', marginBottom: 16, width: 60, height: 60, 
                    background: 'var(--bg3)', borderRadius: 16, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}>{cat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--text)' }}>{cat.name}</div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{cat.count}</div>
                  <div style={{ marginTop: 16, color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Explore <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Everything you need to succeed</h2>
            <p style={{ color: 'var(--text2)', maxWidth: 600, margin: '16px auto 0', fontSize: '1.1rem' }}>
              Built with Gemini AI, Razorpay, and OTP security at its core — FleX handles every step of the freelancing journey effortlessly.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card ai-card" style={{ padding: 32, borderRadius: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `${f.color}15`, color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem',
                  }}>{f.icon}</div>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', background: `${f.color}10`, color: f.color, fontWeight: 700, border: `1px solid ${f.color}30` }}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(56,189,248,0.1))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 32, padding: '80px 40px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '200%', background: 'radial-gradient(ellipse, rgba(108,99,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
            
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: 20 }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: '1.15rem', maxWidth: 600, marginInline: 'auto' }}>
              Join thousands of professionals already using FleX. Verify with OTP in seconds and start collaborating instantly.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 40px', fontSize: '1.05rem', borderRadius: 30 }}>Create Free Account</Link>
              <Link to="/projects" className="btn btn-secondary btn-lg" style={{ padding: '16px 40px', fontSize: '1.05rem', borderRadius: 30 }}>Explore Projects</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
