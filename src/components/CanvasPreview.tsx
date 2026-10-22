import React, { useEffect, useRef, useState } from 'react';
import { MenuData } from '../types/menu';
import { renderMenuToCanvas, FORMAT_DIMENSIONS } from '../utils/canvasRenderer';
import { Maximize2, Minimize2, ZoomIn, RefreshCw } from 'lucide-react';

interface CanvasPreviewProps {
  data: MenuData;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatInfo = FORMAT_DIMENSIONS[data.style.format] || FORMAT_DIMENSIONS['9:16'];

  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        // Render at 0.7x for lightning-fast live preview updates
        await renderMenuToCanvas(canvasRef.current, data, 0.7);
      } catch (err) {
        console.error('Error al renderizar canvas preview:', err);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [data]);

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Marco de preview */}
      <div
        className={`relative w-full flex items-center justify-center transition-all ${
          isExpanded ? 'fixed inset-0 z-50 bg-neutral-950/95 p-4 flex items-center justify-center' : ''
        }`}
      >
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900 transition-all ${
            isExpanded
              ? 'max-h-[92vh] max-w-[92vw] w-auto h-auto'
              : 'w-full max-w-[320px] sm:max-w-[360px] max-h-[460px] sm:max-h-[580px]'
          }`}
          style={{
            aspectRatio: formatInfo.aspect,
          }}
        >
          {/* Canvas elemento WYSIWYG */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Spinner sutil durante renderizado */}
          {isRendering && (
            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-950/70 backdrop-blur-sm text-neutral-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            </div>
          )}

          {/* Botón expandir/reducir preview */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-3 right-3 min-h-[36px] min-w-[36px] p-2 rounded-xl bg-neutral-950/80 backdrop-blur-sm hover:bg-neutral-900 border border-neutral-700/80 text-neutral-200 shadow-md flex items-center justify-center transition-colors"
            title={isExpanded ? 'Cerrar vista grande' : 'Ver pantalla completa'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
