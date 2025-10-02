// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from './contexts/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginForm from './components/auth/LoginForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ResendVerification from './components/auth/ResendVerification';
import NotificationSystem from './components/NotificationSystem';
import DashboardStatus from './components/DashboardStatus';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Signup from './pages/Signup';  
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';  
import AgentDashboard from './pages/AgentDashboard';
import Reports from './pages/Reports';
import RoleRedirect from './components/auth/RoleRedirect';
import NotFound from './components/common/NotFound';


function App() {
  return (
    <AppProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard/>}/>
          <Route path="/reports" element={<Reports/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <NotificationSystem />
        <DashboardStatus />
      </Router>
    </AppProvider>
  );
}

export default App;

