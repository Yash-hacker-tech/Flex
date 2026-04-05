import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'MongoDB', 'TypeScript', 'Vue.js', 'Angular', 'AWS', 'Docker', 'GraphQL', 'Flutter', 'Swift', 'Kotlin', 'PostgreSQL', 'Redis', 'Figma', 'Photoshop', 'SEO', 'Content Writing', 'Data Analysis', 'Machine Learning', 'TensorFlow'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    hourlyRate: user?.hourlyRate || '',
    company: user?.company || '',
    industry: user?.industry || '',
    availability: user?.availability || 'available',
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', url: '' });
  const [addingPortfolio, setAddingPortfolio] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [tab, setTab] = useState('profile');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
    setNewSkill('');
  };

  const removeSkill = (s) => set('skills', form.skills.filter(sk => sk !== s));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/auth/update-profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    setAddingPortfolio(true);
    try {
      const { data } = await API.put('/users/portfolio/add', portfolioForm);
      updateUser({ portfolio: data.portfolio });
      setPortfolioForm({ title: '', description: '', url: '' });
      setShowPortfolioForm(false);
      toast.success('Portfolio item added!');
    } catch (err) { toast.error('Failed to add portfolio item'); }
    finally { setAddingPortfolio(false); }
  };

  const handleRemovePortfolio = async (itemId) => {
    try {
      const { data } = await API.delete(`/users/portfolio/${itemId}`);
      updateUser({ portfolio: data.portfolio });
      toast.success('Portfolio item removed');
    } catch { toast.error('Failed to remove'); }
  };

  const profilePct = user?.profileCompletion || 0;

  return (
    <div className="page">
      <div className="container-sm">
        <div className="page-header">
          <h1 className="section-title">My Profile</h1>
        </div>

        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>Profile Completion</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: profilePct >= 60 ? 'var(--green)' : 'var(--gold)' }}>{profilePct}%</div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${profilePct}%` }} /></div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 8 }}>
            {profilePct < 60 ? '⚠️ Complete 60% to post projects / receive AI matches' : '✅ Profile complete'}
          </div>
        </div>

        <div className="tabs">
          {['profile', 'portfolio', 'security'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="fade-in">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem' }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{user?.role}</div>
                  {user?.rating > 0 && <div style={{ color: 'var(--gold)', fontSize: '0.85rem', marginTop: 4 }}>★ {user.rating} ({user.reviewCount} reviews)</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input placeholder="City, Country" value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                {user?.role === 'freelancer' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Hourly Rate (₹)</label>
                      <input type="number" placeholder="e.g. 1500" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Availability</label>
                      <select value={form.availability} onChange={e => set('availability', e.target.value)}>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </>
                )}
                {user?.role === 'client' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input placeholder="Your Company" value={form.company} onChange={e => set('company', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input placeholder="e.g. Technology" value={form.industry} onChange={e => set('industry', e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea rows={4} placeholder="Tell clients about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} />
              </div>

              {user?.role === 'freelancer' && (
                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSkill(newSkill)}>Add</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                      <button key={s} type="button" onClick={() => addSkill(s)} style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer', transition: 'var(--transition)' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent2)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)'; }}
                      >+ {s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.skills.map(s => (
                      <span key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                        {s} <span style={{ marginLeft: 4, color: 'var(--red)' }}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'portfolio' && user?.role === 'freelancer' && (
          <div className="fade-in">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Portfolio</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPortfolioForm(!showPortfolioForm)}>
                {showPortfolioForm ? 'Cancel' : '+ Add Item'}
              </button>
            </div>
            {showPortfolioForm && (
              <div className="card" style={{ marginBottom: 20 }}>
                <form onSubmit={handleAddPortfolio}>
                  <div className="form-group">
                    <label className="form-label">Title <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input placeholder="Project name" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea rows={3} placeholder="What you built and technologies used" value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL</label>
                    <input type="url" placeholder="https://..." value={portfolioForm.url} onChange={e => setPortfolioForm({ ...portfolioForm, url: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingPortfolio}>
                    {addingPortfolio ? <><span className="spinner" />Adding...</> : 'Add Item'}
                  </button>
                </form>
              </div>
            )}
            {(user?.portfolio || []).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎨</div>
                <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>No portfolio items yet. Add your best work!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
                {(user?.portfolio || []).map(item => (
                  <div key={item._id} className="card" style={{ padding: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
                      <button onClick={() => handleRemovePortfolio(item._id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                    </div>
                    {item.description && <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 10, lineHeight: 1.5 }}>{item.description}</p>}
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🔗 View Project</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'security' && (
          <div className="fade-in">
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.newPassword.length < 8) { toast.error('Password must be at least 8 chars'); return; }
    setLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" placeholder="Min. 8 characters" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" />Changing...</> : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
