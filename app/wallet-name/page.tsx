'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon } from '../components/ui/Icons';

export default function WalletName() {
  const router = useRouter();
  const [walletName, setWalletName] = useState('');

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 pt-12">


      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-8 text-white"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[#14b8a6] mb-2">Wallet name</h1>
      <p className="text-gray-400 mb-8">Enter a name for your wallet</p>

      {/* Input */}
      <input
        type="text"
        placeholder="Wallet Name"
        value={walletName}
        onChange={(e) => setWalletName(e.target.value)}
        className="w-full bg-[#2a2a2a] rounded-lg px-4 py-4 text-white placeholder:text-gray-500 outline-none mb-auto"
      />

      {/* Buttons */}
      <div className="w-full space-y-4 mt-auto pb-8">
        <Button
          onClick={() => router.push('/secret-phrase')}
          variant="primary"
          disabled={!walletName.trim()}
        >
          Next
        </Button>
        <Button
          onClick={() => router.back()}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}


