import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  icon,
  rightIcon,
}) => {
  return (
    <div className={`relative flex items-center bg-[#2a2a2a] rounded-lg ${className}`}>
      {icon && (
        <div className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#14b8a6] text-white">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-transparent border-none outline-none text-white placeholder:text-gray-400 py-4 ${
          icon ? 'pl-12' : 'pl-4'
        } ${rightIcon ? 'pr-12' : 'pr-4'}`}
      />
      {rightIcon && (
        <div className="absolute right-3 flex items-center justify-center">
          {rightIcon}
        </div>
      )}
    </div>
  );
};


