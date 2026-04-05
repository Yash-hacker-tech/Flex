import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function FreelancerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/users/${id}/profile`);
        setFreelancer(data.user);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!freelancer) return <div className="page"><div className="container"><p style={{ color: 'var(--text2)' }}>Freelancer not found</p></div></div>;

  return (
    <div className="page">
      <div className="container-sm">
        <div className="card" style={{ marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem', flexShrink: 0 }}>
              {freelancer.avatar
                ? <img src={freelancer.avatar} alt={freelancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : freelancer.name?.charAt(0)?.toUpperCase()
              }
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{freelancer.name}</h1>
              <p style={{ color: 'var(--text2)', marginBottom: 12 }}>{freelancer.title || 'Freelancer'}</p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)', fontSize: '1.2rem' }}>★ {freelancer.rating || 'New'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1.2rem' }}>₹{freelancer.hourlyRate}/hr</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent2)', fontSize: '1.2rem' }}>{freelancer.completedProjects || 0}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Completed</div>
                </div>
              </div>
              {user?.role === 'client' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/post-project" className="btn btn-primary btn-sm">Hire for Project</Link>
                  <Link to="/messages" className="btn btn-secondary btn-sm">💬 Message</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {freelancer.bio && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>About</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{freelancer.bio}</p>
          </div>
        )}

        {freelancer.skills?.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Skills</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {freelancer.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        {freelancer.portfolio?.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Portfolio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {freelancer.portfolio.map((item, i) => (
                <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                  <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.description}</p>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent2)', marginTop: 8, display: 'inline-block' }}>View Project →</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
