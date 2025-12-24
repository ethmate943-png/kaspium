'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SettingsIcon, QRCodeIcon, ArrowRightIcon, CopyIcon, ShareIcon } from '../components/ui/Icons';

export default function Receive() {
  const router = useRouter();
  const address = 'kaspa:qzjvt68kx5y2rk35f5hhzpf80s94vlxvgjzld18sks8u0z21up3ecfsz7njvh';

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">


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

      {/* Receive form */}
      <div className="flex-1 px-6 py-8">
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Receive 0</h2>
          
          {/* Address */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-2">
              <div className="text-[#14b8a6] text-sm break-all flex-1">
                {address.split('').map((char, i) => {
                  const isHighlighted = i >= address.length - 8;
                  return (
                    <span key={i} className={isHighlighted ? 'text-[#14b8a6]' : 'text-gray-300'}>
                      {char}
                    </span>
                  );
                })}
              </div>
              <button>
                <CopyIcon className="w-5 h-5 text-[#14b8a6]" />
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-6">
            <Input
              placeholder="Enter Amount (Optional)"
              icon={<ArrowRightIcon className="w-4 h-4" />}
            />
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="w-64 h-64 border-4 border-[#14b8a6] rounded-lg bg-white p-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#14b8a6] flex items-center justify-center">
                <span className="text-white text-2xl font-bold">K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8">
        <Button variant="outline">
          <div className="flex items-center justify-center gap-2">
            <ShareIcon className="w-5 h-5" />
            <span>Share Address</span>
          </div>
        </Button>
      </div>
    </div>
  );
}


