'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackspaceIcon } from '../components/ui/Icons';

export default function PinConfirm() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (pin.length === 5) {
      const timer = setTimeout(() => {
        router.push('/password-setup');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, router]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 5) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', ''],
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">


      {/* Title */}
      <h1 className="text-2xl font-semibold text-[#14b8a6] mb-8">Confirm your PIN</h1>

      {/* PIN dots */}
      <div className="flex gap-3 mb-16">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 ${
              index < pin.length
                ? 'bg-[#14b8a6] border-[#14b8a6]'
                : 'border-[#14b8a6]'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs">
        {numbers.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-6 mb-4">
            {row.map((num, colIndex) => {
              if (rowIndex === 3 && colIndex === 0) {
                return <div key="empty-left" className="w-16" />;
              }
              if (rowIndex === 3 && colIndex === 2) {
                return (
                  <button
                    key="backspace"
                    onClick={handleBackspace}
                    className="w-16 h-16 rounded-lg border-2 border-[#14b8a6] flex items-center justify-center text-white"
                  >
                    <BackspaceIcon className="w-6 h-6" />
                  </button>
                );
              }
              return (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="w-16 h-16 rounded-lg text-[#14b8a6] text-2xl font-semibold hover:bg-[#14b8a6]/10 transition-colors"
                >
                  {num}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

