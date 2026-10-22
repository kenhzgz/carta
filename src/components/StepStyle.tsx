import React from 'react';
import { MenuFormat, MenuStyle, LeaderStyle, TextAlignment } from '../types/menu';
import { MENU_FONTS } from '../utils/fonts';
import { FORMAT_DIMENSIONS } from '../utils/canvasRenderer';
import { Sparkles, Sliders, Type, AlignLeft, AlignCenter } from 'lucide-react';

interface StepStyleProps {
  style: MenuStyle;
  onChange: (updated: MenuStyle) => void;
}

interface QuickStylePreset {
  name: string;
  badge: string;
  fontFamily: string;
  headingFontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  priceColor: string;
  boxColor: string;
  boxOpacity: number;
  boxRadius: number;
  leaderStyle: LeaderStyle;
  textShadow: boolean;
}

const QUICK_PRESETS: QuickStylePreset[] = [
  {
    name: 'Bistró Gourmet',
    badge: 'Elegante',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    headingFontFamily: "'Playfair Display', serif",
    primaryColor: '#ffffff',
    secondaryColor: '#d1d5db',
    priceColor: '#fbbf24',
    boxColor: '#000000',
    boxOpacity: 0.45,
    boxRadius: 28,
    leaderStyle: 'dots',
    textShadow: true,
  },
  {
    name: 'Pizarra Urbana',
    badge: 'Chalkboard',
    fontFamily: "'Caveat', cursive",
    headingFontFamily: "'Bebas Neue', sans-serif",
    primaryColor: '#ffffff',
    secondaryColor: '#e2e8f0',
    priceColor: '#facc15',
    boxColor: '#000000',
    boxOpacity: 0.25,
    boxRadius: 20,
    leaderStyle: 'dots',
    textShadow: true,
  },
  {
    name: 'Taberna Rústica',
    badge: 'Clásico',
    fontFamily: "'Lora', serif",
    headingFontFamily: "'Cormorant Garamond', serif",
    primaryColor: '#fdfbf7',
    secondaryColor: '#e5e7eb',
    priceColor: '#e0a96d',
    boxColor: '#1a120b',
    boxOpacity: 0.5,
    boxRadius: 24,
    leaderStyle: 'line',
    textShadow: true,
  },
  {
    name: 'Minimal Nórdico',
    badge: 'Moderno',
    fontFamily: "'Outfit', sans-serif",
    headingFontFamily: "'Outfit', sans-serif",
    primaryColor: '#18181b',
    secondaryColor: '#52525b',
    priceColor: '#09090b',
    boxColor: '#ffffff',
    boxOpacity: 0.85,
    boxRadius: 24,
    leaderStyle: 'dash',
    textShadow: false,
  },
  {
    name: 'Trattoria Chic',
    badge: 'Italiano',
    fontFamily: "'DM Sans', sans-serif",
    headingFontFamily: "'Bodoni Moda', serif",
    primaryColor: '#fffbeb',
    secondaryColor: '#fde68a',
    priceColor: '#f59e0b',
    boxColor: '#451a03',
    boxOpacity: 0.55,
    boxRadius: 32,
    leaderStyle: 'dots',
    textShadow: true,
  },
];

const CURRENCIES = ['€', '$', '£', 'CHF', 'S/', 'MXN'];

export const StepStyle: React.FC<StepStyleProps> = ({ style, onChange }) => {
  const applyQuickPreset = (preset: QuickStylePreset) => {
    onChange({
      ...style,
      fontFamily: preset.fontFamily,
      headingFontFamily: preset.headingFontFamily,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      priceColor: preset.priceColor,
      boxColor: preset.boxColor,
      boxOpacity: preset.boxOpacity,
      boxRadius: preset.boxRadius,
      leaderStyle: preset.leaderStyle,
      textShadow: preset.textShadow,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Estilos Rápidos de un toque */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Estilos Rápidos (1 toque)
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {QUICK_PRESETS.map((qp) => (
            <button
              key={qp.name}
              type="button"
              onClick={() => applyQuickPreset(qp)}
              className="p-3 text-left rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 hover:bg-neutral-850 transition-all group"
            >
              <span className="text-[10px] text-amber-400 font-medium block">{qp.badge}</span>
              <p className="text-xs font-semibold text-neutral-200 group-hover:text-white mt-0.5">{qp.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Formato de pantalla */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-3">
        <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase block">
          Formato de Imagen
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['9:16', '4:5', 'a4', '1:1'] as MenuFormat[]).map((fmt) => {
            const isSelected = style.format === fmt;
            const info = FORMAT_DIMENSIONS[fmt];
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => onChange({ ...style, format: fmt })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-200">{fmt.toUpperCase()}</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {info.width}x{info.height}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">{info.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Tipografía (16 fuentes) */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Type className="w-4 h-4 text-amber-400" />
            <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Tipografía (16 Fuentes)
            </label>
          </div>
          <span className="text-[11px] text-amber-400 font-mono">
            {MENU_FONTS.find((f) => f.family === style.fontFamily)?.name || 'Personalizada'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
          {MENU_FONTS.map((font) => {
            const isSelected = style.fontFamily === font.family;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onChange({ ...style, fontFamily: font.family, headingFontFamily: font.family })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <p className="text-xs font-medium text-neutral-200" style={{ fontFamily: font.family }}>
                  {font.name}
                </p>
                <span className="text-[10px] text-neutral-500">{font.category}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Tamaños, Espaciados y Márgenes */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-4">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-amber-400" />
          <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Ajustes de Dimensiones
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Tamaño de letra</span>
              <span className="font-mono text-amber-400">{Math.round((style.fontSizeScale || 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={style.fontSizeScale || 1.0}
              onChange={(e) => onChange({ ...style, fontSizeScale: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Espaciado de platos</span>
              <span className="font-mono text-amber-400">{Math.round((style.itemSpacing || 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.4"
              step="0.05"
              value={style.itemSpacing || 1.0}
              onChange={(e) => onChange({ ...style, itemSpacing: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Márgenes</span>
              <span className="font-mono text-amber-400">{Math.round((style.marginScale || 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={style.marginScale || 1.0}
              onChange={(e) => onChange({ ...style, marginScale: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 5. Separador plato-precio, Alineación y Moneda */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-4">
        {/* Separador de precio */}
        <div className="space-y-2">
          <label className="text-xs text-neutral-400 block font-medium">Guía entre plato y precio:</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'dots', label: 'Puntos (. . .)' },
              { id: 'line', label: 'Línea (———)' },
              { id: 'dash', label: 'Guiones (- - -)' },
              { id: 'none', label: 'Sin guía' },
            ].map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onChange({ ...style, leaderStyle: lead.id as LeaderStyle })}
                className={`py-2 px-1 text-xs rounded-xl border text-center transition-all ${
                  style.leaderStyle === lead.id
                    ? 'border-amber-400 bg-amber-500/15 text-white font-semibold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {lead.label}
              </button>
            ))}
          </div>
        </div>

        {/* Moneda y Posición */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 block">Símbolo de moneda:</label>
            <div className="flex gap-1.5">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => onChange({ ...style, currency: curr })}
                  className={`min-h-[40px] px-3 rounded-lg border text-xs font-mono font-bold ${
                    style.currency === curr
                      ? 'border-amber-400 bg-amber-500 text-neutral-950'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
              <input
                type="text"
                value={style.currency}
                onChange={(e) => onChange({ ...style, currency: e.target.value })}
                placeholder="Otra"
                className="w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 text-xs font-mono text-center"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 block">Alineación de encabezados:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...style, alignment: 'left' })}
                className={`min-h-[40px] py-1 px-3 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${
                  style.alignment === 'left' ? 'border-amber-400 bg-amber-500/15 text-white font-semibold' : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Izquierda</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...style, alignment: 'center' })}
                className={`min-h-[40px] py-1 px-3 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${
                  style.alignment === 'center' ? 'border-amber-400 bg-amber-500/15 text-white font-semibold' : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Centrado</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Colores, Sombra y Recuadro translúcido */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-4">
        <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase block">
          Colores, Sombra y Recuadro
        </label>

        {/* Paletas de color específicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400 block">Texto platos</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.primaryColor}
                onChange={(e) => onChange({ ...style, primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-300">{style.primaryColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400 block">Descripciones</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.secondaryColor}
                onChange={(e) => onChange({ ...style, secondaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-300">{style.secondaryColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400 block">Color de precios</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.priceColor}
                onChange={(e) => onChange({ ...style, priceColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-300">{style.priceColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400 block">Color recuadro</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.boxColor}
                onChange={(e) => onChange({ ...style, boxColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-300">{style.boxColor}</span>
            </div>
          </div>
        </div>

        {/* Recuadro translúcido opacity */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Opacidad del recuadro translúcido</span>
            <span className="font-mono text-amber-400">{Math.round((style.boxOpacity || 0) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={style.boxOpacity || 0}
            onChange={(e) => onChange({ ...style, boxOpacity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Toggles extras */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-neutral-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={style.textShadow}
              onChange={(e) => onChange({ ...style, textShadow: e.target.checked })}
              className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Sombra de texto (mejora legibilidad sobre fotos)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={style.showSectionDividers}
              onChange={(e) => onChange({ ...style, showSectionDividers: e.target.checked })}
              className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Líneas divisorias decorativas</span>
          </label>
        </div>
      </section>
    </div>
  );
};
