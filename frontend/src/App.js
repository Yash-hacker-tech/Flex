import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import PostProject from './pages/PostProject';
import FreelancerList from './pages/FreelancerList';
import FreelancerProfile from './pages/FreelancerProfile';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Proposals from './pages/Proposals';
import Payments from './pages/Payments';
import AIRecommendations from './pages/AIRecommendations';
import Reviews from './pages/Reviews';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner" style={{width:40,height:40}} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/freelancers" element={<FreelancerList />} />
        <Route path="/freelancers/:id" element={<FreelancerProfile />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/ai-recommendations" element={<ProtectedRoute role="freelancer"><AIRecommendations /></ProtectedRoute>} />
        <Route path="/post-project" element={<ProtectedRoute role="client"><PostProject /></ProtectedRoute>} />
        <Route path="/projects/:id/proposals" element={<ProtectedRoute role="client"><Proposals /></ProtectedRoute>} />
        <Route path="/reviews/:projectId" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181f',
              color: '#f0f0f8',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.88rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
