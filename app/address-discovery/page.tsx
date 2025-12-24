'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddressDiscovery() {
  const router = useRouter();
  const [phase, setPhase] = useState<'receive' | 'change'>('receive');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Receive phase: 0-5
    if (phase === 'receive') {
      if (index < 5) {
        const timer = setTimeout(() => {
          setIndex(index + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Switch to change phase
        setTimeout(() => {
          setPhase('change');
          setIndex(0);
        }, 800);
      }
    } else {
      // Change phase: 0-5
      if (index < 5) {
        const timer = setTimeout(() => {
          setIndex(index + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Navigate to password setup
        setTimeout(() => {
          router.push('/password-setup');
        }, 800);
      }
    }
  }, [phase, index, router]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">


      {/* Central graphic */}
      <div className="mb-8">
        <div className="w-32 h-32 rounded-full bg-[#14b8a6] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#14b8a6] opacity-80 blur-xl"></div>
          <svg
            className="w-16 h-16 text-white relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Running Address Discovery
        </h2>
        <p className="text-gray-400">
          {phase === 'receive' ? 'Receive' : 'Change'} Index {index}
        </p>
      </div>
    </div>
  );
}

