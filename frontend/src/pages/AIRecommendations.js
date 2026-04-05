import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState(0);

  const fetchRecs = async () => {
    setLoading(true);
    setAnalysisSteps(0);
    // Animate analysis steps for UX
    const timer = setInterval(() => setAnalysisSteps(prev => prev < 4 ? prev + 1 : prev), 900);
    try {
      const { data } = await API.post('/ai/recommend-jobs');
      setRecs(data.recommendations);
      setFetched(true);
      toast.success(`Gemini found ${data.recommendations.length} AI-matched jobs!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecs(); }, []);

  const steps = [
    '🔍 Reading your profile & skills...',
    '📊 Analyzing open projects...',
    '🧠 Gemini computing match scores...',
    '✨ Ranking best opportunities...',
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', borderRadius: 20, padding: '5px 14px', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>
              <GeminiIcon size={14} /> Powered by Gemini AI
            </div>
            <h1 className="section-title">Your AI Job Recommendations</h1>
            <p style={{ color: 'var(--text2)', marginTop: 6 }}>
              Personalized projects matched to your skills, experience & hourly rate
            </p>
          </div>
          <button className="btn btn-primary" onClick={fetchRecs} disabled={loading}>
            {loading ? <><span className="spinner" />Analyzing...</> : '🔄 Refresh Matches'}
          </button>
        </div>

        {/* Profile insight card */}
        <div className="card ai-card" style={{ marginBottom: 28, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 44, height: 44, fontSize: '1.1rem', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {user?.skills?.slice(0, 6).map(s => <span key={s} className="tag" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                {(user?.skills?.length || 0) > 6 && <span className="tag" style={{ fontSize: '0.75rem' }}>+{user.skills.length - 6}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--green)' }}>₹{user?.hourlyRate}/hr</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Hourly Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold)' }}>★ {user?.rating || 0}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent2)' }}>{user?.completedProjects || 0}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state with Gemini analysis steps */}
        {loading && (
          <div className="card ai-card" style={{ textAlign: 'center', padding: '50px 32px' }}>
            <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(108,99,255,0.15)', borderTop: '3px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid rgba(66,133,244,0.15)', borderBottom: '2px solid #60a5fa', animation: 'spin 1.2s linear infinite reverse' }} />
              <GeminiIcon size={28} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#60a5fa' }} />
            </div>
            <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 20, fontSize: '1rem' }}>Gemini AI is analyzing your profile</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: i < analysisSteps ? 'var(--green)' : i === analysisSteps ? 'var(--accent2)' : 'var(--text3)', fontSize: '0.85rem', transition: 'color 0.3s' }}>
                  <span style={{ fontSize: '0.7rem' }}>{i < analysisSteps ? '✓' : i === analysisSteps ? '⟳' : '○'}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && fetched && recs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤔</div>
            <h3 style={{ marginBottom: 8 }}>No strong matches found</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Complete your profile with more skills to improve matching</p>
            <Link to="/profile" className="btn btn-primary">Update Profile</Link>
          </div>
        )}

        {!loading && recs.length > 0 && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: '0.88rem' }}>
              <GeminiIcon size={14} />
              {recs.length} personalized recommendations • Sorted by match score
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recs.map((rec, i) => (
                <RecCard key={i} rec={rec} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GeminiIcon({ size = 20, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#gemini-grad)" />
      <path d="M12 6l1.5 4.5L18 12l-4.5 1.5L12 18l-1.5-4.5L6 12l4.5-1.5L12 6z" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B59B6" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RecCard({ rec, rank }) {
  const [expanded, setExpanded] = useState(false);
  const p = rec.project;
  if (!p) return null;

  const scoreColor = rec.matchScore >= 85 ? 'var(--green)' : rec.matchScore >= 70 ? 'var(--accent2)' : 'var(--gold)';

  return (
    <div className="card fade-in" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
      {rank <= 3 && (
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '1.1rem' }}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
      )}

      <div className="flex-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${scoreColor}20`, border: `2px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.78rem', color: scoreColor, flexShrink: 0 }}>
              {rec.matchScore}%
            </div>
            <Link to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{p.title}</h3>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-accent">{p.category?.replace(/_/g, ' ')}</span>
            <span className="badge badge-gray">{p.experienceLevel}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1.2rem' }}>
            ₹{p.budgetMin?.toLocaleString()}–₹{p.budgetMax?.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>{p.budgetType}</div>
          {rec.suggestedBid && (
            <div style={{ fontSize: '0.78rem', color: 'var(--accent2)', marginTop: 2 }}>Suggest: ₹{rec.suggestedBid?.toLocaleString()}</div>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>{rec.reasoning}</p>

      {rec.whyGoodFit?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {rec.whyGoodFit.map(w => <span key={w} className="badge badge-green" style={{ fontSize: '0.72rem' }}>✓ {w}</span>)}
        </div>
      )}

      {rec.coverLetterTip && (
        <div style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem' }}>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}><GeminiIcon size={12} style={{ display: 'inline', marginRight: 4 }} />Gemini Tip: </span>
          <span style={{ color: 'var(--text2)' }}>{rec.coverLetterTip}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to={`/projects/${p._id}`} className="btn btn-primary btn-sm">View Project →</Link>
        <Link to={`/projects/${p._id}`} className="btn btn-secondary btn-sm">Submit Proposal</Link>
        <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: '0.75rem' }}>
          {p.proposalCount} proposals · {new Date(p.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
