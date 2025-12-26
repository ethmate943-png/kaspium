'use client';

import { useRouter } from 'next/navigation';
import { Button } from './components/ui/Button';

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 flex items-center justify-center">
            <img src="/kaspa.png" alt="Kaspa Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Welcome text */}
      <h1 className="text-xl font-bold text-white text-center mb-4 leading-relaxed max-w-md">Kaspium is a self-custodial wallet for the Kaspa network</h1>
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
