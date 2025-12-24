'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ShieldIcon, QRCodeIcon, CurrencyIcon, LanguageIcon, ThemeIcon, NetworkIcon, ContactsIcon, AdvancedIcon, BackupIcon, DonateIcon, EmailIcon, ShareIcon, LogoutIcon } from '../components/ui/Icons';

export default function Settings() {
  const router = useRouter();

  const preferences = [
    { icon: CurrencyIcon, title: 'Currency', subtitle: '$ US Dollar', onClick: undefined },
    { icon: LanguageIcon, title: 'Language', subtitle: 'System Default', onClick: undefined },
    { icon: ThemeIcon, title: 'Theme', subtitle: 'Dark Theme', onClick: undefined },
    { icon: ShieldIcon, title: 'Security', onClick: undefined },
    { icon: NetworkIcon, title: 'Network', onClick: undefined },
  ];

  const manage = [
    { icon: ContactsIcon, title: 'Contacts' },
    { icon: AdvancedIcon, title: 'Advanced' },
    { icon: BackupIcon, title: 'Backup Secret Phrase' },
    { icon: DonateIcon, title: 'Donate' },
    { icon: EmailIcon, title: 'Contact Support', subtitle: 'Email support@kaspium.io' },
    { icon: ShareIcon, title: 'Share Kaspium' },
    { icon: LogoutIcon, title: 'Logout / Switch Wallet', onClick: () => router.push('/') },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">


      {/* Header */}
      <div className="pt-10 px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()}>
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button>
              <QRCodeIcon className="w-6 h-6 text-white" />
            </button>
            <button className="text-white">⋯</button>
          </div>
        </div>

        {/* Wallet info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
            <span className="text-white text-xl font-bold">KA</span>
          </div>
          <div>
            <div className="text-white text-lg font-semibold">kas</div>
          </div>
        </div>

        {/* Receive Address */}
        <div className="mb-8">
          <div className="text-gray-400 text-sm mb-2">Receive Address</div>
          <div className="text-[#14b8a6] text-sm break-all">
            kaspa:qzjvt68kx5y2rk35f5hhzpf80s94vlxvgjzld18sks8u0z21up3ecfsz7njvh
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="px-6 mb-6">
        <h3 className="text-gray-400 text-sm font-medium mb-4">Preferences</h3>
        <div className="space-y-1">
          {preferences.map((item, index) => {
            const IconComponent = item.icon;
            const Component = item.onClick ? 'button' : 'div';
            return (
              <Component
                key={index}
                onClick={item.onClick}
                className={`flex items-center gap-4 py-4 border-b border-[#2a2a2a] ${item.onClick ? 'w-full text-left' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#14b8a6] flex items-center justify-center text-white">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-gray-400 text-sm">{item.subtitle}</div>
                  )}
                </div>
                <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180" />
              </Component>
            );
          })}
        </div>
      </div>

      {/* Manage */}
      <div className="px-6 pb-8">
        <h3 className="text-gray-400 text-sm font-medium mb-4">Manage</h3>
        <div className="space-y-1">
          {manage.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 py-4 border-b border-[#2a2a2a] text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#14b8a6] flex items-center justify-center text-white">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-gray-400 text-sm">{item.subtitle}</div>
                  )}
                </div>
                <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


