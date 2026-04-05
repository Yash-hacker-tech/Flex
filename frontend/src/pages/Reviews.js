import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Reviews() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/reviews/project/${projectId}`);
        setReviews(data.reviews || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reviews', { projectId, ...form });
      toast.success('Review submitted!');
      const { data } = await API.get(`/reviews/project/${projectId}`);
      setReviews(data.reviews || []);
      setForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="container-sm">
        <div className="page-header">
          <h1 className="section-title">Project Reviews</h1>
        </div>

        {/* Submit review form */}
        <div className="card ai-card" style={{ marginBottom: 28, padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Leave a Review</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                    ★
                  </button>
                ))}
                <span style={{ color: 'var(--text2)', fontSize: '0.85rem', alignSelf: 'center', marginLeft: 6 }}>{form.rating}/5</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea rows={4} placeholder="Share your experience with this project..." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" />Submitting...</> : '⭐ Submit Review'}
            </button>
          </form>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>All Reviews ({reviews.length})</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⭐</div>
            <p style={{ color: 'var(--text2)' }}>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map(r => (
              <div key={r._id} className="card fade-in" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                    {r.reviewer?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewer?.name}</div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.87rem', lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
