import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Lock, Mail, Phone, MapPin, UserCheck, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import authValidation from '../utils/authValidation';
import { UserRole } from '../../../shared/types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 72 - RS Puram');
  const [city, setCity] = useState('Coimbatore');
  const [role, setRole] = useState<UserRole>('citizen');
  const [showPassword, setShowPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validation = authValidation.validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
      phone,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const user = await register(
        {
          name,
          email,
          password,
          phone,
          ward,
          city,
          role,
        },
        { strategy: role === 'citizen' ? 'citizen' : 'official' }
      );

      if (user.role === 'citizen') {
        navigate('/citizen-dashboard');
      } else {
        navigate('/official-dashboard');
      }
    } catch (err: any) {
      setServerError(err.message || err.response?.data?.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-800 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join CivicSwarm AI GovTech Platform</p>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === 'citizen'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} />
            <span>Citizen Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('officer')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === 'officer'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            <span>Official Register</span>
          </button>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Arun Kumar"
            leftIcon={<UserIcon className="w-4 h-4" />}
            error={validationErrors.name}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="citizen@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={validationErrors.email}
          />

          <Input
            label="Phone Number"
            type="text"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: '' }));
            }}
            placeholder="+91-9988771001"
            leftIcon={<Phone className="w-4 h-4" />}
            error={validationErrors.phone}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ward & Zone</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Ward 72 - RS Puram">Ward 72 - RS Puram</option>
                <option value="Ward 54 - Gandhipuram">Ward 54 - Gandhipuram</option>
                <option value="Ward 38 - Peelamedu">Ward 38 - Peelamedu</option>
                <option value="Ward 22 - Saravanampatti">Ward 22 - Saravanampatti</option>
                <option value="Ward 62 - Singanallur">Ward 62 - Singanallur</option>
                <option value="Ward 82 - Ukkadam">Ward 82 - Ukkadam</option>
              </select>
            </div>
          </div>

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: '' }));
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

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationErrors.confirmPassword) setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={validationErrors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full py-3 mt-2"
          >
            Create {role === 'citizen' ? 'Citizen' : 'Official'} Account
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
