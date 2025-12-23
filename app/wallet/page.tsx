'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { SettingsIcon, QRCodeIcon, ArrowRightIcon } from '../components/ui/Icons';

export default function Wallet() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transactions' | 'utxos'>('transactions');

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 text-white text-sm">
        <span>1:58</span>
      </div>

      {/* Header */}
      <div className="pt-10 px-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/settings')}>
            <SettingsIcon className="w-6 h-6 text-white" />
          </button>
          <button>
            <QRCodeIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="text-center mb-2">
          <div className="text-2xl font-semibold text-white">$0.00000000</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center">
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">0</span>
            <span className="text-[#14b8a6]">$0.0454 / KAS</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] px-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-4 text-sm font-medium ${
            activeTab === 'transactions'
              ? 'text-[#14b8a6] border-b-2 border-[#14b8a6]'
              : 'text-gray-400'
          }`}
        >
          TRANSACTIONS
        </button>
        <button
          onClick={() => setActiveTab('utxos')}
          className={`flex-1 py-4 text-sm font-medium ${
            activeTab === 'utxos'
              ? 'text-[#14b8a6] border-b-2 border-[#14b8a6]'
              : 'text-gray-400'
          }`}
        >
          UTXOs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="bg-[#2a2a2a] rounded-lg p-6 border-l-4 border-[#14b8a6]">
          <p className="text-white">
            {activeTab === 'transactions'
              ? 'This is the transactions tab. Once you send or receive a transaction, it will show up here.'
              : 'This is the UTXOs tab. All UTXOs in your wallet will appear here'}
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-8 flex gap-4">
        <Button
          onClick={() => router.push('/receive')}
          variant="primary"
          className="flex-1"
        >
          Receive
        </Button>
        <Button
          onClick={() => router.push('/send')}
          variant="primary"
          className="flex-1"
        >
          Send
        </Button>
      </div>
    </div>
  );
}


