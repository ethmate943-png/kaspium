'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SettingsIcon, QRCodeIcon, ArrowRightIcon, AtIcon, ClipboardIcon } from '../components/ui/Icons';

export default function Send() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 text-white text-sm">
        <span>1:58</span>
      </div>

      {/* Header */}
      <div className="pt-10 px-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()}>
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
        <button className="flex-1 py-4 text-sm font-medium text-[#14b8a6] border-b-2 border-[#14b8a6]">
          TRANSACTIONS
        </button>
        <button className="flex-1 py-4 text-sm font-medium text-gray-400">
          UTXOs
        </button>
      </div>

      {/* Send form */}
      <div className="flex-1 px-6 py-8">
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">SEND</h2>
          
          <div className="mb-4">
            <div className="text-white mb-2">Available</div>
            <div className="text-[#14b8a6] text-lg">0 KAS</div>
            <div className="text-[#14b8a6] text-sm">(≈ $0.00000000)</div>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              icon={<ArrowRightIcon className="w-4 h-4" />}
            />
            <Input
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<AtIcon className="w-4 h-4" />}
              rightIcon={<ClipboardIcon className="w-5 h-5 text-[#14b8a6]" />}
            />
            <div>
              <Input
                placeholder="Enter Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rightIcon={<ClipboardIcon className="w-5 h-5 text-[#14b8a6]" />}
              />
              <p className="text-gray-400 text-sm mt-1 ml-4">(Optional)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-8 space-y-4">
        <Button variant="primary">Send</Button>
        <Button variant="outline">Scan QR Code</Button>
      </div>
    </div>
  );
}


