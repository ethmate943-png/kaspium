'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, KeyIcon, RefreshIcon } from '../components/ui/Icons';

export default function SecretPhrase() {
  const router = useRouter();
  const [words] = useState([
    'axis', 'fire', 'elegant', 'mind',
    'notable', 'peanut', 'section', 'federal',
    'slender', 'hour', 'brown', 'outside'
  ]);

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
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-3xl font-bold text-[#14b8a6]">Secret Phrase</h1>
        <KeyIcon className="w-6 h-6 text-[#14b8a6]" />
      </div>

      {/* Words grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {words.map((word, index) => (
          <div key={index} className="text-left">
            <span className="text-gray-400 text-sm">{index + 1})</span>
            <span className="text-[#14b8a6] ml-1">{word}</span>
          </div>
        ))}
      </div>

      {/* Refresh button */}
      <button className="flex items-center justify-center gap-2 border-2 border-[#14b8a6] rounded-full px-6 py-3 mb-8 text-white">
        <RefreshIcon className="w-5 h-5 text-[#14b8a6]" />
        <span className="text-white">24 WORDS</span>
      </button>

      {/* Continue button */}
      <div className="mt-auto pb-8">
        <Button
          onClick={() => router.push('/pin-confirm')}
          variant="primary"
        >
          I&apos;ve Backed It Up
        </Button>
      </div>
    </div>
  );
}


