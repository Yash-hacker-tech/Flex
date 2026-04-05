import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

export default function FreelancerList() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (skill) params.set('skill', skill);
        const { data } = await API.get(`/users/freelancers?${params}`);
        setFreelancers(data.freelancers || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search, skill]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Find Freelancers</h1>
          <p style={{ color: 'var(--text2)' }}>Browse AI-verified professionals for your projects</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 340 }}
          />
          <input
            placeholder="Filter by skill (e.g. React)"
            value={skill}
            onChange={e => setSkill(e.target.value)}
            style={{ maxWidth: 240 }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
          </div>
        ) : freelancers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--text2)' }}>No freelancers found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {freelancers.map(f => (
              <Link key={f._id} to={`/freelancers/${f._id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.2rem' }}>
                      {f.avatar
                        ? <img src={f.avatar} alt={f.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : f.name?.charAt(0)?.toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{f.name}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{f.title || 'Freelancer'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)' }}>★ {f.rating || 'New'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Rating</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}>₹{f.hourlyRate}/hr</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Rate</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent2)' }}>{f.completedProjects || 0}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Jobs</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {f.skills?.slice(0, 4).map(s => <span key={s} className="tag" style={{ fontSize: '0.72rem' }}>{s}</span>)}
                    {f.skills?.length > 4 && <span className="tag" style={{ fontSize: '0.72rem' }}>+{f.skills.length - 4}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
