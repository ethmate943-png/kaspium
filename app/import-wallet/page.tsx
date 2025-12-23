'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon } from '../components/ui/Icons';

export default function ImportWallet() {
  const router = useRouter();

  const options = [
    {
      title: 'Import Standard Wallet',
      description: 'Standard derivation 12 or 24 word wallets with optional BIP39 passphrase',
      route: '/import-standard',
    },
    {
      title: 'Import Legacy Wallet',
      description: 'Legacy derivation 12 word wallets compatible with legacy Web Wallet and KDX',
      route: '/import-legacy',
    },
    {
      title: 'Import Watch Only Wallet',
      description: 'Monitor the balance and transactions of a wallet using an extended public key',
      route: '/import-watch-only',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 pt-12">
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 text-white text-sm">
        <span>1:57</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-8 text-white"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[#14b8a6] mb-2">Import Wallet</h1>
      <p className="text-gray-400 mb-8">Please select an option below.</p>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => router.push(option.route)}
            className="w-full bg-[#2a2a2a] rounded-lg p-4 text-left"
          >
            <div className="text-white font-semibold mb-1">{option.title}</div>
            <div className="text-gray-400 text-sm">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Go Back button */}
      <div className="mt-auto pb-8">
        <Button
          onClick={() => router.back()}
          variant="secondary"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}


