import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContractForm from './pages/ContractForm';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import PaymentTracker from './pages/PaymentTracker';
import Reports from './pages/Reports';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/Loader';

// ProtectedRoute checks authentication from AuthContext
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader message="Verifying authentication session..." />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication Gateway */}
          <Route path="/login" element={<Login />} />
          
          {/* Core Administrative Console */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/contract-form" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ContractForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/contracts" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ContractList />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ContractDetail />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PaymentTracker />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all Routing Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      />
    </AuthProvider>
  );
}

