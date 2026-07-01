'use client';

import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500': variant === 'primary',
          'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500': variant === 'secondary',
          'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400': variant === 'ghost',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
    >
      {children}
    </button>
  );
}
