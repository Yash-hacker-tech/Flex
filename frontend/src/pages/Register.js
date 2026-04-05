import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = { FORM: 'form', OTP: 'otp', DONE: 'done' };

export default function Register() {
  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.role) { toast.error('Please select your role'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const data = await sendOtp(form.email);
      setStep(STEPS.OTP);
      toast.success(`OTP sent to ${form.email} ✉️`);
      startResendTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const startResendTimer = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    try {
      const data = await sendOtp(form.email);
      startResendTimer();
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally { setLoading(false); }
  };

  // ── OTP Input Handling ────────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  // ── Step 2: Verify OTP & Register ────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const { otpToken: token } = await verifyOtp(form.email, code);
      setOtpToken(token);
      // Now register with the verified token
      const data = await register(form.name, form.email, form.password, form.role, token);
      toast.success(`Welcome to FleX, ${data.user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  // ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="fade-in">

        {/* ── STEP INDICATOR ─────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {['Fill Details', 'Verify Email', 'Done!'].map((label, i) => {
            const stepIdx = i; // 0,1,2
            const currentIdx = step === STEPS.FORM ? 0 : step === STEPS.OTP ? 1 : 2;
            const active = stepIdx === currentIdx;
            const done = stepIdx < currentIdx;
            return (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.8rem',
                    background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg3)',
                    color: done || active ? '#fff' : 'var(--text3)',
                    border: active ? '2px solid var(--accent2)' : 'none',
                    boxShadow: active ? '0 0 16px rgba(108,99,255,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: active ? 'var(--accent2)' : 'var(--text3)', fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, maxWidth: 40, background: done ? 'var(--green)' : 'var(--border2)', marginBottom: 18, transition: 'all 0.3s' }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: REGISTRATION FORM ──────────────────── */}
        {step === STEPS.FORM && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Join FleX today</h1>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Create your free account in seconds</p>
            </div>

            <div className="card">
              {/* Role selection */}
              <div style={{ marginBottom: 24 }}>
                <div className="form-label" style={{ marginBottom: 10 }}>I want to...</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { role: 'client', icon: '💼', title: 'Hire Talent', desc: 'Post projects & find freelancers' },
                    { role: 'freelancer', icon: '🚀', title: 'Find Work', desc: 'Browse projects & earn money' },
                  ].map(({ role, icon, title, desc }) => (
                    <button key={role} type="button"
                      onClick={() => setForm({ ...form, role })}
                      style={{
                        padding: 16, borderRadius: 10, cursor: 'pointer',
                        border: form.role === role ? '2px solid var(--accent)' : '2px solid var(--border2)',
                        background: form.role === role ? 'rgba(108,99,255,0.1)' : 'var(--bg3)',
                        color: 'var(--text)', textAlign: 'left',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <span className="form-hint">Must be at least 8 characters</span>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                  {loading ? <><span className="spinner" />Sending OTP...</> : '📧 Send Verification OTP'}
                </button>
              </form>

              <p style={{ fontSize: '0.78rem', color: 'var(--text3)', textAlign: 'center', marginTop: 16 }}>
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>

              <div className="divider" />
              <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '0.88rem' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--accent2)', fontWeight: 600 }}>Sign in</Link>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: OTP VERIFICATION ───────────────────── */}
        {step === STEPS.OTP && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✉️</div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Check your inbox</h1>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                We sent a 6-digit verification code to<br />
                <strong style={{ color: 'var(--accent2)' }}>{form.email}</strong>
              </p>
            </div>

            <div className="card">
              <form onSubmit={handleVerify}>
                <div style={{ marginBottom: 24 }}>
                  <div className="form-label" style={{ marginBottom: 16, textAlign: 'center' }}>Enter Verification Code</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        style={{
                          width: 52, height: 60, textAlign: 'center',
                          fontSize: '1.5rem', fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          borderRadius: 10,
                          border: digit ? '2px solid var(--accent)' : '2px solid var(--border2)',
                          background: digit ? 'rgba(108,99,255,0.08)' : 'var(--bg3)',
                          boxShadow: digit ? '0 0 12px rgba(108,99,255,0.2)' : 'none',
                          transition: 'var(--transition)',
                          caretColor: 'var(--accent)',
                        }}
                        autoComplete="off"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || otp.join('').length < 6}>
                  {loading ? <><span className="spinner" />Verifying...</> : '✅ Verify & Create Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 8 }}>
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || loading}
                  style={{
                    background: 'none', border: 'none', cursor: resendCountdown > 0 ? 'default' : 'pointer',
                    color: resendCountdown > 0 ? 'var(--text3)' : 'var(--accent2)',
                    fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  }}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : '🔄 Resend OTP'}
                </button>
              </div>

              <div className="divider" />
              <button
                onClick={() => { setStep(STEPS.FORM); setOtp(['', '', '', '', '', '']); }}
                style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                ← Change email address
              </button>
            </div>

            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--text3)', textAlign: 'center' }}>
              🔒 The OTP expires in 10 minutes for your security
            </div>
          </>
        )}
      </div>
    </div>
  );
}
