import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Proposals() {
  const { user } = useAuth();
  const { id: projectId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'client' && projectId) {
          const [propsRes, projRes] = await Promise.all([
            API.get(`/proposals/project/${projectId}`),
            API.get(`/projects/${projectId}`),
          ]);
          setProposals(propsRes.data.proposals);
          setProject(projRes.data.project);
        } else {
          const { data } = await API.get('/proposals/my');
          setProposals(data.proposals);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user.role, projectId]);

  const handleAccept = async (proposalId) => {
    if (!window.confirm('Accept this proposal? Other proposals will be rejected.')) return;
    try {
      await API.put(`/proposals/${proposalId}/accept`);
      toast.success('Proposal accepted! Project is now active.');
      setProposals(prev => prev.map(p => ({ ...p, status: p._id === proposalId ? 'accepted' : 'rejected' })));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (proposalId) => {
    try {
      await API.put(`/proposals/${proposalId}/reject`);
      toast.success('Proposal rejected');
      setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'rejected' } : p));
    } catch (err) { toast.error('Failed to reject'); }
  };

  const handleWithdraw = async (proposalId) => {
    if (!window.confirm('Withdraw this proposal?')) return;
    try {
      await API.put(`/proposals/${proposalId}/withdraw`);
      toast.success('Proposal withdrawn');
      setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'withdrawn' } : p));
    } catch (err) { toast.error('Failed to withdraw'); }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-gold', accepted: 'badge-green', rejected: 'badge-red', shortlisted: 'badge-blue', withdrawn: 'badge-gray', expired: 'badge-gray' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">
            {user.role === 'client' && project ? `Proposals for "${project.title}"` : 'My Proposals'}
          </h1>
          <p style={{ color: 'var(--text2)' }}>
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
            {user.role === 'freelancer' && ' · 30 proposals/month on free plan'}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
          </div>
        ) : proposals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No proposals yet</p>
            {user.role === 'freelancer' && <Link to="/projects" className="btn btn-primary">Browse Projects</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proposals.map(prop => (
              <div key={prop._id} className="card fade-in" style={{ padding: 22 }}>
                <div className="flex-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    {user.role === 'client' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div className="avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                          {prop.freelancer?.avatar
                            ? <img src={prop.freelancer.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : prop.freelancer?.name?.charAt(0)?.toUpperCase()
                          }
                        </div>
                        <div>
                          <Link to={`/freelancers/${prop.freelancer?._id}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            {prop.freelancer?.name}
                          </Link>
                          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            <span style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>★ {prop.freelancer?.rating || 'New'}</span>
                            <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{prop.freelancer?.completedProjects || 0} projects</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link to={`/projects/${prop.project?._id}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', textDecoration: 'none' }}>
                        {prop.project?.title}
                      </Link>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1.1rem' }}>
                      ₹{prop.bidAmount} <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text3)' }}>{prop.bidType}</span>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.78rem', marginTop: 2 }}>{prop.deliveryTime} days delivery</div>
                    {statusBadge(prop.status)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                  <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.65 }}>
                    {prop.coverLetter?.substring(0, 300)}{prop.coverLetter?.length > 300 ? '...' : ''}
                  </p>
                </div>

                {user.role === 'client' && prop.freelancer?.skills?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {prop.freelancer.skills.slice(0, 6).map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                )}

                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>
                    {new Date(prop.createdAt).toLocaleDateString()}
                    {prop.status === 'pending' && ` · Expires ${new Date(prop.expiresAt).toLocaleDateString()}`}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {user.role === 'client' && prop.status === 'pending' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAccept(prop._id)}>✓ Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(prop._id)}>✗ Reject</button>
                        <Link to={`/freelancers/${prop.freelancer?._id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                      </>
                    )}
                    {user.role === 'freelancer' && prop.status === 'pending' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(prop._id)}>Withdraw</button>
                    )}
                    {user.role === 'client' && prop.status === 'accepted' && (
                      <Link to={`/projects/${prop.project?._id || projectId}`} className="btn btn-secondary btn-sm">View Project</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
