import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', deliveryTime: '', milestones: [] });
  const [submitting, setSubmitting] = useState(false);
  const [aiImprove, setAiImprove] = useState(null);
  const [improvingCover, setImprovingCover] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/projects/${id}`);
        setProject(data.project);
      } catch { toast.error('Project not found'); navigate('/projects'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/proposals', { projectId: id, ...proposal, bidAmount: parseFloat(proposal.bidAmount), deliveryTime: parseInt(proposal.deliveryTime) });
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally { setSubmitting(false); }
  };

  const fetchAIMatches = async () => {
    setAiLoading(true);
    try {
      const { data } = await API.post('/ai/match-freelancers', { projectId: id });
      setAiMatches(data.matches);
      toast.success(`Found ${data.matches.length} AI-matched freelancers!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI matching failed');
    } finally { setAiLoading(false); }
  };

  const improveCoverLetter = async () => {
    if (!proposal.coverLetter || proposal.coverLetter.length < 20) {
      toast.error('Write at least 20 characters first');
      return;
    }
    setImprovingCover(true);
    try {
      const { data } = await API.post('/ai/improve-proposal', {
        coverLetter: proposal.coverLetter,
        projectTitle: project.title,
        projectDescription: project.description,
        freelancerSkills: user?.skills,
      });
      setAiImprove(data);
    } catch (err) {
      toast.error('AI improvement failed');
    } finally { setImprovingCover(false); }
  };

  if (loading) return (
    <div className="page"><div className="container">
      <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 300 }} />
    </div></div>
  );

  if (!project) return null;

  const isOwner = user?._id === project.client?._id;
  const canPropose = user?.role === 'freelancer' && project.status === 'open';

  return (
    <div className="page">
      <div className="container-sm">
        <Link to="/projects" style={{ color: 'var(--text2)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Projects
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          {/* Main */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="flex-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span className={`badge badge-${project.status === 'open' ? 'green' : project.status === 'active' ? 'accent' : 'gray'}`} style={{ marginBottom: 8 }}>{project.status.replace('_',' ').toUpperCase()}</span>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{project.title}</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}>
                    ₹{project.budgetMin?.toLocaleString()}–₹{project.budgetMax?.toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{project.budgetType === 'fixed' ? '📌 Fixed Price' : '⏱ Hourly Rate'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                <span className="badge badge-accent">{project.category?.replace(/_/g,' ')}</span>
                <span className="badge badge-gray">{project.experienceLevel}</span>
                <span className="badge badge-gray">{project.projectLength} term</span>
                {project.deadline && (
                  <span className="badge badge-gold">📅 Due {new Date(project.deadline).toLocaleDateString()}</span>
                )}
              </div>

              <p style={{ color: 'var(--text2)', lineHeight: 1.75, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{project.description}</p>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.9rem' }}>Skills Required</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {project.skills?.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>

              {project.milestones?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Project Milestones</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {project.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.status === 'paid' ? 'var(--green)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.status === 'paid' ? '✓' : i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.title}</div>
                          {m.description && <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{m.description}</div>}
                        </div>
                        <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>₹{m.amount?.toLocaleString()}</div>
                        <span className={`badge badge-${m.status === 'paid' ? 'green' : m.status === 'approved' ? 'blue' : m.status === 'submitted' ? 'gold' : 'gray'}`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Matching (client only) */}
            {isOwner && project.status === 'open' && (
              <div className="card ai-card" style={{ marginBottom: 20 }}>
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>✨ AI Freelancer Matching</h3>
                    <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Gemini AI analyzes your project and ranks the best-fit freelancers</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={fetchAIMatches} disabled={aiLoading}>
                    {aiLoading ? <><span className="spinner" />Analyzing...</> : '🤖 Find Matches'}
                  </button>
                </div>

                {aiMatches.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {aiMatches.map((m, i) => (
                      <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                        <div className="flex-between" style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                              {m.freelancer?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.freelancer?.name}</div>
                              <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>★ {m.freelancer?.rating} · {m.freelancer?.completedProjects} projects</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: m.compatibilityScore >= 80 ? 'var(--green)' : 'var(--gold)' }}>
                              {m.compatibilityScore}%
                            </div>
                            <div style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>match</div>
                          </div>
                        </div>
                        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 10, lineHeight: 1.5 }}>{m.reasoning}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.strengths?.map(s => <span key={s} className="badge badge-green" style={{ fontSize: '0.72rem' }}>✓ {s}</span>)}
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <Link to={`/freelancers/${m.freelancer?._id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Proposal form */}
            {canPropose && (
              <div className="card">
                {!showProposalForm ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <h3 style={{ marginBottom: 8 }}>Interested in this project?</h3>
                    <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: '0.88rem' }}>Submit a proposal to get started</p>
                    <button className="btn btn-primary" onClick={() => setShowProposalForm(true)}>Submit a Proposal</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProposal}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Your Proposal</h3>

                    <div className="form-group">
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <label className="form-label">Cover Letter <span style={{ color: 'var(--red)' }}>*</span></label>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={improveCoverLetter} disabled={improvingCover}>
                          {improvingCover ? <><span className="spinner" />Improving...</> : '✨ AI Improve'}
                        </button>
                      </div>
                      <textarea
                        rows={6} placeholder="Describe your approach, relevant experience, and why you're the best fit... (min 100 chars)"
                        value={proposal.coverLetter}
                        onChange={e => setProposal({ ...proposal, coverLetter: e.target.value })}
                        required
                      />
                      <span className="form-hint">{proposal.coverLetter.length}/100 minimum characters</span>
                    </div>

                    {aiImprove && (
                      <div style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                        <div className="flex-between" style={{ marginBottom: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--accent2)' }}>✨ AI Suggestions (Score: {aiImprove.score}/100)</div>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setProposal({ ...proposal, coverLetter: aiImprove.improvedVersion }); setAiImprove(null); }}>Use Improved</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                          {aiImprove.feedback?.map((f, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>• {f}</div>)}
                        </div>
                        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, maxHeight: 160, overflow: 'auto' }}>
                          {aiImprove.improvedVersion}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div className="form-group">
                        <label className="form-label">Your Bid (₹) <span style={{ color: 'var(--red)' }}>*</span></label>
                        <input type="number" placeholder="e.g. 5000" value={proposal.bidAmount} onChange={e => setProposal({ ...proposal, bidAmount: e.target.value })} required />
                        <span className="form-hint">Budget: ₹{project.budgetMin?.toLocaleString()}–₹{project.budgetMax?.toLocaleString()}</span>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Delivery (days) <span style={{ color: 'var(--red)' }}>*</span></label>
                        <input type="number" placeholder="e.g. 14" value={proposal.deliveryTime} onChange={e => setProposal({ ...proposal, deliveryTime: e.target.value })} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? <><span className="spinner" />Submitting...</> : '🚀 Submit Proposal'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowProposalForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {isOwner && (
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Link to={`/projects/${id}/proposals`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  📋 View All Proposals ({project.proposalCount || 0})
                </Link>
                <Link to={`/reviews/${id}`} className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                  ⭐ Reviews
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Project Overview</h4>
              {[
                ['💰 Budget', `₹${project.budgetMin?.toLocaleString()}–₹${project.budgetMax?.toLocaleString()}`],
                ['⏱ Type', project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'],
                ['🎓 Level', project.experienceLevel],
                ['📏 Length', project.projectLength + ' term'],
                ['💼 Proposals', project.proposalCount || 0],
                ['👁 Views', project.views || 0],
                ['📅 Posted', new Date(project.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{k}</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>About the Client</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  {project.client?.avatar
                    ? <img src={project.client.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : project.client?.name?.charAt(0)?.toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.client?.name}</div>
                  {project.client?.company && <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{project.client.company}</div>}
                </div>
              </div>
              {project.client?.rating > 0 && (
                <div style={{ color: 'var(--gold)', fontSize: '0.85rem', marginBottom: 8 }}>★ {project.client.rating} ({project.client.reviewCount} reviews)</div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Link to={`/freelancers/${project.client?._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  View Profile
                </Link>
              </div>
            </div>

            {user && !isOwner && (
              <div className="card" style={{ padding: 16 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={async () => {
                    try {
                      const { data } = await API.post('/messages/conversations', { recipientId: project.client._id, projectId: id });
                      navigate(`/messages/${data.conversation._id}`);
                    } catch (err) { toast.error('Could not open conversation'); }
                  }}
                >
                  💬 Message Client
                </button>
              </div>
            )}

            {project.status === 'completed' && (
              <Link to={`/reviews/${id}`} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                ⭐ Leave a Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
