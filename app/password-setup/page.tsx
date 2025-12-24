'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon } from '../components/ui/Icons';

export default function PasswordSetup() {
  const router = useRouter();

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
      <h1 className="text-3xl font-bold text-[#14b8a6] mb-4">
        Require a password to open this wallet?
      </h1>

      {/* Description */}
      <p className="text-gray-400 mb-2">
        You can create a password to add additional security to your wallet.
      </p>
      <p className="text-gray-400 mb-12">
        <span className="text-[#14b8a6]">Password is optional</span>, and your wallet will be protected with your PIN or biometrics regardless.
      </p>

      {/* Buttons */}
      <div className="w-full space-y-4 mt-auto pb-8">
        <Button
          onClick={() => router.push('/wallet')}
          variant="primary"
        >
          No, Skip
        </Button>
        <Button
          onClick={() => router.push('/wallet')}
          variant="outline"
        >
          Yes
        </Button>
      </div>
    </div>
  );
}


