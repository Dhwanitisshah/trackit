'use client';

import clsx from 'clsx';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className,
}: InputProps) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={clsx(
          'rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500',
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
