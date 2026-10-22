import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { WifiOff, Check } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500 text-neutral-950 shadow-2xl font-medium text-xs animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Sin conexión · Estás en <strong>Modo Offline</strong> (todo funciona localmente).</span>
      </div>
    </div>
  );
};
