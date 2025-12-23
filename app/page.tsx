'use client';

import { useRouter } from 'next/navigation';
import { Button } from './components/ui/Button';

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">
      {/* Status bar simulation */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 text-white text-sm">
        <span>1:56</span>
      </div>

      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-[#14b8a6] flex items-center justify-center">
          <span className="text-white text-5xl font-bold">K</span>
        </div>
      </div>

      {/* Welcome text */}
      <p className="text-white text-center mb-12 max-w-md leading-relaxed">
        Welcome to Kaspium. To begin, you may create a new wallet or
        import an existing one.
      </p>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-4">
        <Button
          onClick={() => router.push('/wallet-name')}
          variant="primary"
        >
          New Wallet
        </Button>
        <Button
          onClick={() => router.push('/import-wallet')}
          variant="outline"
        >
          Import Wallet
        </Button>
      </div>
    </div>
  );
}
