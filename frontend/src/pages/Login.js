import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = { FORM: 'form', OTP: 'otp' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const startResendTimer = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.otpRequired) {
        setStep(STEPS.OTP);
        toast.success(data.message || `OTP sent to ${form.email}`);
        startResendTimer();
      } else {
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      startResendTimer();
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally { setLoading(false); }
  };

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

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const data = await login(form.email, form.password, code);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        
        {step === STEPS.FORM && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff',
                boxShadow: '0 0 30px rgba(108,99,255,0.4)',
              }}>F</div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Welcome back</h1>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Sign in to your FleX account</p>
            </div>

            <div className="card">
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password" placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                  {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: '0.88rem' }}>
                Don't have an account? <Link to="/register" style={{ color: 'var(--accent2)', fontWeight: 600 }}>Create one free</Link>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16, padding: 16, background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text2)', textAlign: 'center', marginBottom: 8 }}>
                💡 Quick demo — register first, then log in
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text3)', textAlign: 'center' }}>
                Register as a <strong style={{ color: 'var(--accent2)' }}>client</strong> to post projects or as a <strong style={{ color: 'var(--green)' }}>freelancer</strong> to find work
              </p>
            </div>
          </>
        )}

        {step === STEPS.OTP && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✉️</div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Secure Login</h1>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Enter the 6-digit verification code sent to<br />
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
                  {loading ? <><span className="spinner" />Verifying...</> : '✅ Verify & Login'}
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
                ← Return to Login
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
