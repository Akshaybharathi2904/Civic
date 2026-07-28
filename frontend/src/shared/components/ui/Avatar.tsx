import React from 'react';
import { clsx } from 'clsx';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (n?: string) => {
    if (!n) return '';
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-semibold overflow-hidden shrink-0 select-none',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : name ? (
        getInitials(name)
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-slate-400" />
      )}
    </div>
  );
};
