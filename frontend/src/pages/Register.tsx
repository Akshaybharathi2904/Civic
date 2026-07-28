import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, Phone, MapPin, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [ward, setWard] = useState('Ward 72 - RS Puram');
    const [city, setCity] = useState('Coimbatore');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await register({
                name,
                email,
                password,
                phone,
                ward,
                city,
                role: 'citizen'
            });
            navigate('/citizen-dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">

                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white font-outfit">Citizen Portal Register</h2>
                    <p className="text-xs text-slate-400 mt-1">Join CivicSwarm AI Platform (Coimbatore, Tamil Nadu)</p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Arun Kumar"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="citizen@example.com"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91-9988771001"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 font-semibold mb-1">Ward & Zone</label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                                value={ward}
                                onChange={(e) => setWard(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
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

                    <div>
                        <label className="block text-slate-300 font-semibold mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 text-xs"
                    >
                        <span>{isSubmitting ? 'Creating Account...' : 'Create Citizen Account'}</span>
                    </button>
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
