import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Lock, Mail, ArrowRight, Eye, EyeOff, UserCheck, Shield } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import authValidation from '../utils/authValidation';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStrategy, setAuthStrategy] = useState<'citizen' | 'official'>('citizen');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'citizen') {
      setEmail('citizen1@example.com');
      setPassword('password123');
      setAuthStrategy('citizen');
    } else if (roleParam === 'officer') {
      setEmail('officer1@pwd.gov.in');
      setPassword('password123');
      setAuthStrategy('official');
    } else if (roleParam === 'admin') {
      setEmail('admin@civicswarm.gov.in');
      setPassword('password123');
      setAuthStrategy('official');
    }
  }, [searchParams]);

  const setDemoAccount = (role: 'citizen' | 'officer' | 'admin') => {
    if (role === 'citizen') {
      setEmail('citizen1@example.com');
      setPassword('password123');
      setAuthStrategy('citizen');
    } else if (role === 'officer') {
      setEmail('officer1@pwd.gov.in');
      setPassword('password123');
      setAuthStrategy('official');
    } else if (role === 'admin') {
      setEmail('admin@civicswarm.gov.in');
      setPassword('password123');
      setAuthStrategy('official');
    }
    setValidationErrors({});
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validation = authValidation.validateLoginForm({ email, password });
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});
    setLoading(true);

    try {
      const user = await login(email, password, { strategy: authStrategy });
      if (user.role === 'citizen') {
        navigate('/citizen-dashboard');
      } else {
        navigate('/official-dashboard');
      }
    } catch (err: any) {
      setServerError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Strategy Selector Pill */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setAuthStrategy('citizen')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authStrategy === 'citizen'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} />
            <span>Citizen Auth</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthStrategy('official')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authStrategy === 'official'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            <span>Official Auth Flow</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white font-outfit">
            Sign In to CivicSwarm
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {authStrategy === 'citizen' ? 'Citizen Portal Access' : 'Government Official & Command Flow'}
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Quick Demo Login Presets:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('citizen')}
              className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[11px] border border-slate-700 transition-colors"
            >
              Citizen Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('officer')}
              className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-purple-400 font-mono text-[11px] border border-slate-700 transition-colors"
            >
              Officer Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin')}
              className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-[11px] border border-slate-700 transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder="officer1@pwd.gov.in"
            leftIcon={<Mail className="w-4 h-4" />}
            error={validationErrors.email}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={validationErrors.password}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full py-3 mt-2"
          >
            Sign In ({authStrategy === 'citizen' ? 'Citizen' : 'Official'})
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
