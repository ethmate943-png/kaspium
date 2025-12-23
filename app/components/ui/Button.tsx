import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const baseStyles = 'w-full rounded-lg px-6 py-4 font-medium transition-colors';
  
  const variants = {
    primary: disabled 
      ? 'bg-[#14b8a6]/50 text-white/50 cursor-not-allowed' 
      : 'bg-[#14b8a6] text-white hover:bg-[#0d9488]',
    secondary: disabled
      ? 'bg-[#2a2a2a]/50 text-white/50 cursor-not-allowed'
      : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]',
    outline: disabled
      ? 'border-2 border-[#14b8a6]/50 bg-transparent text-[#14b8a6]/50 cursor-not-allowed'
      : 'border-2 border-[#14b8a6] bg-transparent text-[#14b8a6] hover:bg-[#14b8a6]/10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

