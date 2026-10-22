import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, X, CheckCircle, WifiOff, QrCode } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed as a standalone PWA, show a minimal status or offline badge
  if (isInstalled) {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Offline Activo</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="min-h-[40px] px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 active:scale-95 text-amber-400 font-semibold text-xs rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        title="Instalar Carta en tu móvil para usarla sin conexión"
      >
        <Smartphone className="w-4 h-4 text-amber-400" />
        <span>Instalar en el móvil</span>
      </button>

      {/* Modal con instrucciones guiadas para Android, iOS y QR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">Instalar Carta en tu teléfono</h3>
                <p className="text-xs text-neutral-400">Funciona al 100% sin conexión a internet</p>
              </div>
            </div>

            {/* Si el navegador soporta el trigger nativo directo */}
            {isInstallable && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <p className="text-xs text-amber-300 font-medium">
                  Tu navegador permite instalación directa en un clic:
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await install();
                    if (ok) setShowModal(false);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar ahora</span>
                </button>
              </div>
            )}

            {/* Instrucciones para iPhone / iPad (iOS Safari) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px]">
                  iOS
                </span>
                <span>En iPhone o iPad (Safari):</span>
              </div>
              <ol className="text-xs text-neutral-400 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">1.</span>
                  <span>
                    Abre la app en Safari y pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-neutral-200" /> en la barra inferior.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">2.</span>
                  <span>
                    Desplaza hacia abajo y selecciona <strong>«Añadir a la pantalla de inicio»</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">3.</span>
                  <span>
                    Pulsa <strong>Añadir</strong>. ¡Listo! Se abrirá como app nativa a pantalla completa y sin internet.
                  </span>
                </li>
              </ol>
            </div>

            {/* Instrucciones para Android (Chrome / Brave / Edge) */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px]">
                  AND
                </span>
                <span>En Android (Chrome / Edge):</span>
              </div>
              <ol className="text-xs text-neutral-400 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">1.</span>
                  <span>
                    Pulsa el menú de <strong>tres puntos (⋮)</strong> en la esquina superior derecha del navegador.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">2.</span>
                  <span>
                    Toca en <strong>«Instalar aplicación»</strong> o <strong>«Añadir a la pantalla principal»</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400">3.</span>
                  <span>
                    Confirma la instalación. El icono de Carta aparecerá en tu cajón de apps junto a tus aplicaciones móviles.
                  </span>
                </li>
              </ol>
            </div>

            {/* Ventajas offline */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <p className="font-medium text-neutral-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>¿Por qué funciona offline?</span>
              </p>
              <p>
                Todas las tipografías, texturas (pizarra, madera, mármol, etc.) y el motor de dibujo en alta resolución se guardan en la memoria local de tu dispositivo a través del Service Worker y almacenamiento local.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-950 hover:bg-neutral-850 rounded-xl transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
