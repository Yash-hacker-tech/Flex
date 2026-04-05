import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'web_development', label: '💻 Web Development' },
  { value: 'mobile_development', label: '📱 Mobile Apps' },
  { value: 'design', label: '🎨 Design' },
  { value: 'writing', label: '📝 Writing' },
  { value: 'marketing', label: '📈 Marketing' },
  { value: 'data_science', label: '📊 Data Science' },
  { value: 'ai_ml', label: '🤖 AI & ML' },
  { value: 'video_audio', label: '🎬 Video & Audio' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'other', label: '🔧 Other' },
];

const STEPS = ['Basics', 'Details', 'Budget', 'Review'];

export default function PostProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    skills: '', tags: '',
    budgetType: 'fixed', budgetMin: '', budgetMax: '',
    deadline: '', experienceLevel: 'intermediate', projectLength: 'medium',
    visibility: 'public', saveAsDraft: false,
    milestones: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const analyzeProject = async () => {
    if (!form.title || !form.description) { toast.error('Fill title and description first'); return; }
    setAnalyzing(true);
    try {
      const { data } = await API.post('/ai/analyze-project', {
        title: form.title, description: form.description,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        budgetMin: parseFloat(form.budgetMin), budgetMax: parseFloat(form.budgetMax),
        budgetType: form.budgetType,
      });
      setAiAnalysis(data);
      toast.success('Gemini AI analysis complete!');
    } catch { toast.error('AI analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const addMilestone = () => setForm(f => ({ ...f, milestones: [...f.milestones, { title: '', description: '', amount: '' }] }));
  const updateMilestone = (i, key, val) => {
    const ms = [...form.milestones];
    ms[i] = { ...ms[i], [key]: val };
    setForm(f => ({ ...f, milestones: ms }));
  };
  const removeMilestone = (i) => setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (asDraft = false) => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        budgetMin: parseFloat(form.budgetMin),
        budgetMax: parseFloat(form.budgetMax),
        saveAsDraft: asDraft,
        milestones: form.milestones.map(m => ({ ...m, amount: parseFloat(m.amount) })).filter(m => m.title && m.amount),
      };
      const { data } = await API.post('/projects', payload);
      toast.success(asDraft ? 'Saved as draft!' : 'Project posted successfully!');
      navigate(`/projects/${data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post project');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container-sm">
        <div className="page-header">
          <h1 className="section-title">Post a Project</h1>
          <p style={{ color: 'var(--text2)' }}>Tell us what you need done and let Gemini AI find the perfect freelancer</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: i < step ? 'pointer' : 'default' }} onClick={() => i < step && setStep(i)}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, background: i <= step ? 'var(--accent)' : 'var(--bg4)', color: i <= step ? '#fff' : 'var(--text3)' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text)' : 'var(--text3)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--accent)' : 'var(--border)', margin: '14px 8px' }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          {step === 0 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>Project Basics</h2>
              <div className="form-group">
                <label className="form-label">Project Title <span style={{ color: 'var(--red)' }}>*</span></label>
                <input placeholder="e.g. Build a React E-Commerce Website" value={form.title} onChange={e => set('title', e.target.value)} maxLength={100} />
                <span className="form-hint">{form.title.length}/100 · 10 minimum</span>
              </div>
              <div className="form-group">
                <label className="form-label">Category <span style={{ color: 'var(--red)' }}>*</span></label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Description <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea rows={7} placeholder="Describe your project in detail. Include goals, deliverables, and requirements... (min 50 chars)" value={form.description} onChange={e => set('description', e.target.value)} />
                <span className="form-hint">{form.description.length} chars · 50 minimum</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>Skills & Details</h2>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)" value={form.skills} onChange={e => set('skills', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Project Length</label>
                  <select value={form.projectLength} onChange={e => set('projectLength', e.target.value)}>
                    <option value="short">Short (&lt; 1 month)</option>
                    <option value="medium">Medium (1-3 months)</option>
                    <option value="long">Long (3+ months)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline (optional)</label>
                  <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <select value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                    <option value="public">Public</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Project Milestones</label>
                    <div className="form-hint">Break your project into payment checkpoints</div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addMilestone}>+ Add Milestone</button>
                </div>
                {form.milestones.map((m, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 10, border: '1px solid var(--border)' }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Milestone {i + 1}</span>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMilestone(i)}>Remove</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                      <input placeholder="Milestone title" value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} />
                      <input type="number" placeholder="Amount ₹" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)} />
                    </div>
                    <input style={{ marginTop: 8 }} placeholder="Description (optional)" value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>Budget & Pricing</h2>
              <div className="form-group">
                <label className="form-label">Budget Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { val: 'fixed', icon: '📌', label: 'Fixed Price', desc: 'One total price for the project' },
                    { val: 'hourly', icon: '⏱', label: 'Hourly Rate', desc: 'Pay per hour of work' },
                  ].map(({ val, icon, label, desc }) => (
                    <button key={val} type="button" onClick={() => set('budgetType', val)} style={{ padding: 16, borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: form.budgetType === val ? '2px solid var(--accent)' : '2px solid var(--border2)', background: form.budgetType === val ? 'rgba(108,99,255,0.1)' : 'var(--bg3)', color: 'var(--text)' }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.78rem', marginTop: 2 }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Minimum Budget (₹)</label>
                  <input type="number" placeholder={form.budgetType === 'fixed' ? 'e.g. 5000' : 'e.g. 500'} value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Budget (₹)</label>
                  <input type="number" placeholder={form.budgetType === 'fixed' ? 'e.g. 15000' : 'e.g. 2000'} value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
                </div>
              </div>

              <div style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>✨ Gemini AI Analysis</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Get AI feedback on your listing quality and budget</div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={analyzeProject} disabled={analyzing}>
                    {analyzing ? <><span className="spinner" />Analyzing...</> : 'Analyze'}
                  </button>
                </div>
                {aiAnalysis && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
                      {[
                        { label: 'Quality Score', value: aiAnalysis.quality, color: aiAnalysis.quality >= 70 ? 'var(--green)' : 'var(--gold)' },
                        { label: 'Budget', value: aiAnalysis.budgetAssessment || 'Fair', color: 'var(--accent2)' },
                        { label: 'Complexity', value: aiAnalysis.complexityLevel, color: 'var(--text)' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color, textTransform: 'capitalize' }}>{item.value}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {aiAnalysis.suggestions?.map((s, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>💡 {s}</div>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Review & Post</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Title', form.title],
                  ['Category', CATEGORIES.find(c => c.value === form.category)?.label],
                  ['Budget', `₹${form.budgetMin} – ₹${form.budgetMax} (${form.budgetType})`],
                  ['Experience', form.experienceLevel],
                  ['Length', form.projectLength + ' term'],
                  ['Visibility', form.visibility],
                  ['Milestones', form.milestones.length > 0 ? `${form.milestones.length} milestones` : 'None'],
                ].map(([k, v]) => (
                  <div key={k} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{k}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{v || '—'}</span>
                  </div>
                ))}
                <div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 8 }}>Description</div>
                  <div style={{ color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.6, maxHeight: 120, overflow: 'auto', background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                    {form.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-between">
          <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={loading}>Save Draft</button>
                <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <><span className="spinner" />Posting...</> : '🚀 Post Project'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
