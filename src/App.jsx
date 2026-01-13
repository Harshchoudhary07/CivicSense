import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import './styles/index.css';

// Citizen Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReportIssue from './pages/ReportIssue';
import MyComplaints from './pages/MyComplaints';
import NearbyIssues from './pages/NearbyIssues';

// Officer Pages
import OfficerLogin from './pages/OfficerLogin';
import OfficerDashboard from './pages/OfficerDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import DepartmentManagement from './pages/DepartmentManagement';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Citizen Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/nearby" element={<NearbyIssues />} />

          {/* Officer Routes */}
          <Route path="/officer/login" element={<OfficerLogin />} />
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
