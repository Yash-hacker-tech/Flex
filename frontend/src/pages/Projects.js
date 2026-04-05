import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../utils/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Apps' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'ai_ml', label: 'AI & ML' },
  { value: 'video_audio', label: 'Video & Audio' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget_high', label: 'Budget: High to Low' },
  { value: 'budget_low', label: 'Budget: Low to High' },
  { value: 'most_proposals', label: 'Most Proposals' },
];

export default function Projects() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    budgetType: '',
    minBudget: '',
    maxBudget: '',
    experienceLevel: '',
    sort: 'newest',
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const { data } = await API.get(`/projects?${params}`);
      setProjects(data.projects);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Browse Projects</h1>
          <p style={{ color: 'var(--text2)' }}>{total.toLocaleString()} projects available</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Filters */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Filters</h3>
            <div className="form-group">
              <label className="form-label">Search</label>
              <input placeholder="Search projects..." value={filters.search} onChange={e => handleFilter('search', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget Type</label>
              <select value={filters.budgetType} onChange={e => handleFilter('budgetType', e.target.value)}>
                <option value="">Any</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget Range (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input type="number" placeholder="Min" value={filters.minBudget} onChange={e => handleFilter('minBudget', e.target.value)} />
                <input type="number" placeholder="Max" value={filters.maxBudget} onChange={e => handleFilter('maxBudget', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select value={filters.experienceLevel} onChange={e => handleFilter('experienceLevel', e.target.value)}>
                <option value="">Any</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setFilters({ search: '', category: '', budgetType: '', minBudget: '', maxBudget: '', experienceLevel: '', sort: 'newest' }); setPage(1); }}>
              Clear Filters
            </button>
          </div>

          {/* Project list */}
          <div>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{loading ? '...' : `${total} results`}</span>
              <select style={{ width: 'auto', padding: '6px 12px' }} value={filters.sort} onChange={e => handleFilter('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
                <p style={{ color: 'var(--text2)' }}>No projects match your filters</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {projects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            )}

            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span style={{ padding: '6px 14px', color: 'var(--text2)', fontSize: '0.88rem' }}>Page {page} of {pages}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project: p }) {
  return (
    <Link to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-hover fade-in" style={{ padding: 22 }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{p.title}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{p.category?.replace(/_/g, ' ')}</span>
              <span className="badge badge-gray">{p.experienceLevel}</span>
              <span className="badge badge-gray">{p.budgetType === 'fixed' ? '📌 Fixed' : '⏱ Hourly'}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1.1rem' }}>
              ₹{p.budgetMin}–₹{p.budgetMax}
            </div>
            <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
              {p.budgetType === 'hourly' ? '/hr' : 'fixed'}
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.87rem', marginBottom: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.description}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {p.skills?.slice(0, 5).map(s => <span key={s} className="tag">{s}</span>)}
          {p.skills?.length > 5 && <span className="tag">+{p.skills.length - 5}</span>}
        </div>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>
              {p.client?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{p.client?.name}</span>
              {p.client?.rating > 0 && <span style={{ marginLeft: 6, color: 'var(--gold)', fontSize: '0.75rem' }}>★ {p.client.rating}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, color: 'var(--text3)', fontSize: '0.78rem' }}>
            <span>💼 {p.proposalCount} proposals</span>
            <span>👁 {p.views} views</span>
            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
