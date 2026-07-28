import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Badge } from '../../../shared/components/ui/Badge';
import { LogOut, User as UserIcon, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user.role === 'citizen') return '/citizen-dashboard';
    return '/official-dashboard';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
      >
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <div className="hidden lg:block text-left">
          <p className="text-xs font-semibold text-slate-100 leading-tight">{user.name}</p>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide">
            {user.role} &bull; #{user.id?.substring(0, 10) || user._id?.substring(0, 10)}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {/* Header section with Unique User ID */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-1">
            <p className="text-sm font-semibold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="pt-2 flex items-center justify-between">
              <Badge variant="cyan" size="sm" className="uppercase">
                {user.role}
              </Badge>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ID: {user.id || user._id}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2 space-y-1 text-xs font-medium">
            <Link
              to={getDashboardPath()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            >
              <LayoutDashboard size={15} className="text-cyan-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            >
              <UserIcon size={15} className="text-cyan-400" />
              <span>Account Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-semibold border-t border-slate-800/60 mt-1"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
