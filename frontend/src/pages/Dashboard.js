import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} style={{ textDecoration: 'none' }}>
    <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</div>
        <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          API.get('/users/dashboard/stats'),
          API.get('/projects/my?limit=5'),
        ]);
        setStats(statsRes.data.stats);
        setRecentProjects(projectsRes.data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const profilePct = user?.profileCompletion || 0;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
              Good day, <span style={{ color: 'var(--accent2)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
              {user?.role === 'client' ? 'Manage your projects and freelancer relationships' : 'Track your proposals and earnings'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user?.role === 'client' ? (
              <Link to="/post-project" className="btn btn-primary">+ Post Project</Link>
            ) : (
              <>
                <Link to="/projects" className="btn btn-secondary">Browse Projects</Link>
                <Link to="/ai-recommendations" className="btn btn-primary">✨ AI Jobs</Link>
              </>
            )}
          </div>
        </div>

        {profilePct < 60 && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }}>⚠️ Complete your profile ({profilePct}%)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                {user?.role === 'client' ? 'You need 60% profile completion to post projects.' : 'A complete profile gets 3x more proposals.'}
              </div>
            </div>
            <Link to="/profile" className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.3)', flexShrink: 0 }}>
              Complete Profile
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
            {user?.role === 'client' ? (
              <>
                <StatCard icon="📋" label="Total Projects" value={stats?.totalProjects || 0} color="var(--accent)" to="/projects/my" />
                <StatCard icon="⚡" label="Active Projects" value={stats?.activeProjects || 0} color="var(--green)" to="/projects/my?status=active" />
                <StatCard icon="✅" label="Completed" value={stats?.completedProjects || 0} color="var(--accent3)" />
                <StatCard icon="💰" label="Total Spent" value={`₹${(stats?.totalSpent || 0).toLocaleString()}`} color="var(--gold)" to="/payments" />
              </>
            ) : (
              <>
                <StatCard icon="📝" label="Proposals Sent" value={stats?.totalProposals || 0} color="var(--accent)" to="/proposals" />
                <StatCard icon="⚡" label="Active Projects" value={stats?.activeProjects || 0} color="var(--green)" />
                <StatCard icon="✅" label="Completed" value={stats?.completedProjects || 0} color="var(--accent3)" />
                <StatCard icon="💰" label="Total Earned" value={`₹${(stats?.totalEarnings || 0).toLocaleString()}`} color="var(--gold)" to="/payments" />
              </>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Projects</h2>
              <Link to="/projects/my" style={{ fontSize: '0.85rem', color: 'var(--accent2)' }}>View all →</Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
                <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No projects yet</p>
                {user?.role === 'client'
                  ? <Link to="/post-project" className="btn btn-primary btn-sm">Post Your First Project</Link>
                  : <Link to="/projects" className="btn btn-primary btn-sm">Find Projects</Link>
                }
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentProjects.map(p => (
                  <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-hover" style={{ padding: '16px 20px' }}>
                      <div className="flex-between">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className={`badge badge-${p.status === 'open' ? 'green' : p.status === 'active' ? 'accent' : 'gray'}`}>{p.status}</span>
                            <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>₹{p.budgetMin}–₹{p.budgetMax}</span>
                          </div>
                        </div>
                        <span style={{ color: 'var(--text3)', fontSize: '0.75rem', flexShrink: 0, marginLeft: 12 }}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: 24 }}>
              <div className="avatar" style={{ width: 60, height: 60, fontSize: '1.4rem', margin: '0 auto 12px' }}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0)?.toUpperCase()
                }
              </div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{user?.name}</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: 14, textTransform: 'capitalize' }}>{user?.role}</div>
              <div style={{ marginBottom: 8 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Profile</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: profilePct < 60 ? 'var(--gold)' : 'var(--green)' }}>{profilePct}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${profilePct}%` }} /></div>
              </div>
              <Link to="/profile" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Edit Profile</Link>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Quick Actions</div>
              {[
                user?.role === 'client' && { to: '/post-project', icon: '📋', label: 'Post a Project' },
                user?.role === 'freelancer' && { to: '/ai-recommendations', icon: '✨', label: 'AI Job Recommendations' },
                { to: '/messages', icon: '💬', label: 'Messages' },
                { to: '/payments', icon: '💳', label: 'Payment History' },
                user?.role === 'freelancer' && { to: '/projects', icon: '🔍', label: 'Browse Projects' },
              ].filter(Boolean).map(item => (
                <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: 'var(--text2)', fontSize: '0.87rem', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'var(--transition)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
