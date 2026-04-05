import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flex_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('flex_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('flex_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('flex_token');
      localStorage.removeItem('flex_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password, otp = null) => {
    const { data } = await API.post('/auth/login', { email, password, otp });
    
    if (data.otpRequired) {
      return data;
    }
    
    // Normal login finish
    localStorage.setItem('flex_token', data.token);
    localStorage.setItem('flex_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, role, otpToken) => {
    const { data } = await API.post('/auth/register', { name, email, password, role, otpToken });
    localStorage.setItem('flex_token', data.token);
    localStorage.setItem('flex_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Send OTP to email
  const sendOtp = async (email) => {
    const { data } = await API.post('/auth/send-otp', { email });
    return data;
  };

  // Verify OTP code
  const verifyOtp = async (email, otp) => {
    const { data } = await API.post('/auth/verify-otp', { email, otp });
    return data; // returns { verified: true, otpToken }
  };

  const logout = () => {
    localStorage.removeItem('flex_token');
    localStorage.removeItem('flex_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('flex_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchMe, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
