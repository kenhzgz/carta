import React, { useRef } from 'react';
import { MenuBackground, PresetBackgroundId } from '../types/menu';
import { PRESET_INFOS } from '../utils/canvasRenderer';
import { Upload, Image as ImageIcon, Sliders, Trash2, Sun, Moon } from 'lucide-react';

interface StepBackgroundProps {
  background: MenuBackground;
  onChange: (bg: MenuBackground) => void;
}

const SOLID_COLORS = [
  { name: 'Negro Carbón', hex: '#121316' },
  { name: 'Pizarra Profunda', hex: '#1e2229' },
  { name: 'Azul Marino', hex: '#0f172a' },
  { name: 'Verde Pino', hex: '#064e3b' },
  { name: 'Borgoña', hex: '#450a0a' },
  { name: 'Crema Suave', hex: '#fdfbf7' },
  { name: 'Gris Perla', hex: '#f1f5f9' },
  { name: 'Ocre Antiguo', hex: '#78350f' },
];

export const StepBackground: React.FC<StepBackgroundProps> = ({ background, onChange }) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...background,
            type: 'image',
            imageUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...background,
            logoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Modo de Fondo */}
      <section className="space-y-3">
        <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          1. Tipo de Fondo
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...background, type: 'preset' })}
            className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              background.type === 'preset'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Texturas</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...background, type: 'color' })}
            className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              background.type === 'color'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-700" />
            <span>Color liso</span>
          </button>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              background.type === 'image'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tu Foto</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
      </section>

      {/* 2. Texturas predeterminadas */}
      {background.type === 'preset' && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">Fondos predeterminados del restaurante:</span>
            <span className="text-xs text-amber-400 font-medium capitalize">
              {PRESET_INFOS[background.presetId]?.name}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {(Object.keys(PRESET_INFOS) as PresetBackgroundId[]).map((pid) => {
              const info = PRESET_INFOS[pid];
              const isSelected = background.presetId === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => onChange({ ...background, presetId: pid })}
                  className={`group relative flex flex-col items-center rounded-xl p-1.5 border transition-all text-left ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className="w-full h-16 rounded-lg overflow-hidden border border-neutral-700 relative shadow-inner"
                    style={{ backgroundColor: info.fallbackColor }}
                  >
                    <img
                      src={info.file}
                      alt={info.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Keep solid fallback color
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="mt-1.5 text-[11px] font-medium text-neutral-300 group-hover:text-white">
                    {info.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Colores Lisos */}
      {background.type === 'color' && (
        <section className="space-y-3">
          <span className="text-xs text-neutral-400">Paleta de colores recomendada:</span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SOLID_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ ...background, color: c.hex })}
                className={`h-11 rounded-xl border flex items-center justify-center transition-all ${
                  background.color === c.hex ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105' : 'border-neutral-700'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-neutral-400">Color personalizado:</span>
            <input
              type="color"
              value={background.color}
              onChange={(e) => onChange({ ...background, color: e.target.value })}
              className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
            />
            <span className="text-xs font-mono text-neutral-400">{background.color}</span>
          </div>
        </section>
      )}

      {/* Foto subida */}
      {background.type === 'image' && (
        <section className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {background.imageUrl && (
              <img
                src={background.imageUrl}
                alt="Fondo personalizado"
                className="w-12 h-12 rounded-lg object-cover border border-neutral-700"
              />
            )}
            <div>
              <p className="text-xs font-medium text-neutral-200">Foto personalizada activa</p>
              <p className="text-[11px] text-neutral-500">Puedes oscurecerla abajo para leer los platos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="min-h-[44px] px-3 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Cambiar</span>
          </button>
        </section>
      )}

      {/* 3. Capa de oscurecido / aclarado */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-neutral-300">Capa de contraste</span>
          </div>
          <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => onChange({ ...background, overlayColor: '#000000' })}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${
                background.overlayColor === '#000000' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Oscurecer</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...background, overlayColor: '#ffffff' })}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${
                background.overlayColor === '#ffffff' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Aclarar</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Intensidad de la capa</span>
            <span className="font-mono text-amber-400">{Math.round(background.overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.85"
            step="0.05"
            value={background.overlayOpacity}
            onChange={(e) => onChange({ ...background, overlayOpacity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>
      </section>

      {/* 4. Logo del Restaurante */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-semibold text-neutral-300">Logo del restaurante</h3>
            <p className="text-[11px] text-neutral-500">Opcional · Aparece centrado en la cabecera</p>
          </div>
          {background.logoUrl ? (
            <button
              type="button"
              onClick={() => onChange({ ...background, logoUrl: undefined })}
              className="min-h-[44px] px-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="min-h-[44px] px-3.5 text-xs bg-amber-500 text-neutral-950 font-semibold rounded-lg hover:bg-amber-400 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Añadir logo</span>
            </button>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        {background.logoUrl && (
          <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-4">
            <div className="w-14 h-14 bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center justify-center">
              <img src={background.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Tamaño del logo</span>
                <span className="font-mono text-amber-400">{Math.round((background.logoScale || 1.0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={background.logoScale || 1.0}
                onChange={(e) => onChange({ ...background, logoScale: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
