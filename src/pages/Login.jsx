import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Lock, Mail, Key, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('admin@ironforge.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failure:", err);
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative z-10">
        
        {/* Header/Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Dumbbell className="h-7 w-7 rotate-45" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold text-white tracking-tight">IronForge B2B</h2>
          <p className="mt-2 text-sm text-slate-400">
            Gym Setup Contract Management System
          </p>
        </div>

        {/* Credentials Suggestion Banner */}
        <div className="bg-slate-950/40 border border-indigo-950/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">
            Submit your credentials to access the administrative dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-xs px-4 py-3 rounded-lg flex items-center animate-pulse">
              <span className="font-semibold mr-1">Error:</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all placeholder-slate-600 text-sm"
                  placeholder="admin@ironforge.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all placeholder-slate-600 text-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4.5 w-4.5 bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 select-none">
                Remember details
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600/10 p-2 rounded-lg text-indigo-400">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">Recover your admin credentials</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm px-4 py-4 rounded-xl text-center">
                <p className="font-semibold">Reset Link Dispatched!</p>
                <p className="text-xs text-emerald-400 mt-1">If the email is registered, instructions are on their way.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter your email address and we'll dispatch a link to securely overwrite your current security credentials.
                </p>
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all placeholder-slate-700 text-sm"
                    placeholder="admin@ironforge.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

