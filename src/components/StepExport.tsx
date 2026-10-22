import React, { useState } from 'react';
import { MenuData, SavedDraft } from '../types/menu';
import { renderMenuToCanvas, FORMAT_DIMENSIONS } from '../utils/canvasRenderer';
import { Download, Share2, Check, Copy, FolderHeart, Trash2, Plus, Sparkles, Smartphone, Wifi } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface StepExportProps {
  data: MenuData;
  savedDrafts: SavedDraft[];
  onLoadDraft: (draft: SavedDraft) => void;
  onSaveNewDraft: (name: string) => void;
  onDeleteDraft: (id: string) => void;
  onResetToSample: () => void;
}

export const StepExport: React.FC<StepExportProps> = ({
  data,
  savedDrafts,
  onLoadDraft,
  onSaveNewDraft,
  onDeleteDraft,
  onResetToSample,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportScale, setExportScale] = useState<1 | 2>(2);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const formatInfo = FORMAT_DIMENSIONS[data.style.format];

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const exportCanvas = document.createElement('canvas');
      await renderMenuToCanvas(exportCanvas, data, exportScale);

      const filename = `${(data.title || 'menu').toLowerCase().replace(/[^a-z0-9]/gi, '-')}-${data.style.format}-${exportScale}x.png`;
      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    setIsExporting(true);
    try {
      const exportCanvas = document.createElement('canvas');
      await renderMenuToCanvas(exportCanvas, data, exportScale);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;

        const filename = `${(data.title || 'menu').toLowerCase().replace(/[^a-z0-9]/gi, '-')}.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: data.title || 'Menú de restaurante',
            text: `Menú de ${data.title}`,
          });
        } else {
          // Fallback to direct download
          const link = document.createElement('a');
          link.download = filename;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error al compartir:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftName.trim()) return;
    onSaveNewDraft(newDraftName.trim());
    setNewDraftName('');
    setShowSaveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjeta Principal de Exportación */}
      <section className="p-5 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl space-y-5 shadow-xl text-center">
        <div className="max-w-xs mx-auto space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
            ¡Menú Listo!
          </span>
          <h2 className="text-lg font-bold text-neutral-100">{data.title || 'Tu Menú'}</h2>
          <p className="text-xs text-neutral-400">
            Formato: {formatInfo.label} ({formatInfo.width * exportScale} × {formatInfo.height * exportScale} px)
          </p>
        </div>

        {/* Selector de resolución */}
        <div className="flex justify-center items-center gap-2 p-1.5 bg-neutral-950/80 rounded-2xl max-w-xs mx-auto border border-neutral-800">
          <button
            type="button"
            onClick={() => setExportScale(1)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
              exportScale === 1 ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Estándar (1x)
          </button>
          <button
            type="button"
            onClick={() => setExportScale(2)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
              exportScale === 2 ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Alta Definición (2x)
          </button>
        </div>

        {/* Botones de acción principales */}
        <div className="space-y-2.5 max-w-sm mx-auto">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="w-full min-h-[48px] py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando archivo...' : 'Descargar Imagen en Alta Calidad'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleNativeShare}
            className="w-full min-h-[44px] py-3 px-4 bg-neutral-850 hover:bg-neutral-800 active:scale-[0.98] text-neutral-200 font-semibold rounded-2xl border border-neutral-700/80 flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Guardar en Galería o Compartir</span>
          </button>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Borrador guardado automáticamente en tu navegador</span>
          </p>
        </div>
      </section>

      {/* 2. Tarjeta: Usar en el teléfono sin conexión (PWA) */}
      <section className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
              <span>Descargar app en tu móvil para usar Offline</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-md font-mono">PWA</span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Instálala en tu pantalla de inicio y diseña menús en cualquier momento, incluso sin Wi-Fi ni datos móviles.
            </p>
          </div>
        </div>
        <div className="shrink-0 w-full sm:w-auto">
          <PWAInstallButton />
        </div>
      </section>

      {/* 2. Gestor de Múltiples Borradores (Ideas para el futuro cumplida) */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Tus Cartas Guardadas ({savedDrafts.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="min-h-[44px] px-3 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Guardar como copia</span>
          </button>
        </div>

        {savedDrafts.length === 0 ? (
          <p className="text-xs text-neutral-500 py-3 text-center">
            Aún no has guardado versiones con nombre. Tu borrador actual siempre está protegido.
          </p>
        ) : (
          <div className="space-y-2">
            {savedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-200 truncate">{draft.name}</p>
                  <p className="text-[10px] text-neutral-500">
                    {new Date(draft.updatedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · {draft.data.sections.reduce((a, s) => a + s.items.length, 0)} platos
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onLoadDraft(draft)}
                    className="min-h-[36px] px-3 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
                  >
                    Cargar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDraft(draft.id)}
                    className="p-2 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                    title="Eliminar borrador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal para guardar copia con nombre */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDraft}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-neutral-100">Guardar Carta con Nombre</h3>
            <p className="text-xs text-neutral-400">
              Guarda una copia independiente para tener varias cartas (ej. Menú de Noche, Carta de Postres, Carta de Verano).
            </p>
            <input
              type="text"
              autoFocus
              value={newDraftName}
              onChange={(e) => setNewDraftName(e.target.value)}
              placeholder="Ej. Menú Fin de Semana"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="min-h-[40px] px-3 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newDraftName.trim()}
                className="min-h-[40px] px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl disabled:opacity-40"
              >
                Guardar Carta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
