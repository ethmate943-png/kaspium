'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, QRCodeIcon, ClipboardIcon } from '../components/ui/Icons';

export default function ImportWatchOnly() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState('');

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
      <h1 className="text-2xl font-bold text-[#14b8a6] mb-2">Import Watch Only Wallet</h1>
      <p className="text-gray-400 mb-8">Please enter your extended public key.</p>

      {/* Input */}
      <div className="relative mb-8">
        <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-center gap-3">
          <button>
            <QRCodeIcon className="w-6 h-6 text-[#14b8a6]" />
          </button>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder=""
            className="flex-1 bg-transparent text-white outline-none"
            autoFocus
          />
          <button>
            <ClipboardIcon className="w-6 h-6 text-[#14b8a6]" />
          </button>
        </div>
      </div>

      {/* Next button */}
      <div className="mt-auto pb-8">
        <Button
          onClick={() => router.push('/wallet')}
          variant="primary"
          disabled={!publicKey.trim()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}


