import React from 'react';
import FindCounselors from './components/Counsellor/FindCounselors';
import MySessions from './components/Session/MySessions';
import SessionHistory from './components/Session/SessionHistory';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import CounsellorDashboard from './components/Dashboard/CounsellorDashboard';
import CounsellorSchedule from './components/Counsellor/CounsellorSchedule';
import CounsellorSessions from './components/Counsellor/CounsellorSessions';
import CounsellorClients from './components/Counsellor/CounsellorClients';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthSelection from './components/Auth/AuthSelection';
import ClientRegister from './components/Auth/ClientRegister';
import CounsellorRegister from './components/Auth/CounsellorRegister';
import Login from './components/Auth/Login';
import VerifyOTP from './components/Auth/VerifyOTP';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<AuthSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<ClientRegister />} />
            <Route path="/register/counsellor" element={<CounsellorRegister />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
            <Route path="/find-counselors" element={<FindCounselors />} />
            <Route path="/my-sessions" element={<MySessions />} />
            <Route path="/session-history" element={<SessionHistory />} /> 
            <Route path="/counsellor-schedule" element={<CounsellorSchedule />} />
            <Route path="/counsellor-sessions" element={<CounsellorSessions />} />
            <Route path="/counsellor-clients" element={<CounsellorClients />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            {/* REMOVED DUPLICATE: <Route path="/admin-dashboard" element={<div>Admin Dashboard - Coming Soon</div>} /> */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;