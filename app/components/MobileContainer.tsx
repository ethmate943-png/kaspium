import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] mx-auto max-w-md relative overflow-hidden">
      {children}
    </div>
  );
};


