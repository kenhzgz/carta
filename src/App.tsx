import React, { useState, useEffect } from 'react';
import { MenuData, SavedDraft } from './types/menu';
import { StepBackground } from './components/StepBackground';
import { StepDishes } from './components/StepDishes';
import { StepStyle } from './components/StepStyle';
import { StepExport } from './components/StepExport';
import { CanvasPreview } from './components/CanvasPreview';
import { SAMPLE_MENU_TEMPLATES, parseMenuText } from './utils/textParser';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Image as ImageIcon,
  UtensilsCrossed,
  Palette,
  Download,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const STORAGE_ACTIVE_DRAFT_KEY = 'carta_active_menu_v1';
const STORAGE_SAVED_DRAFTS_KEY = 'carta_saved_drafts_v1';

const DEFAULT_MENU_DATA: MenuData = {
  title: 'Atelier Bistró',
  subtitle: 'Cocina mediterránea de mercado & brasas',
  footer: 'Precios con IVA incluido · Pregunte por nuestra carta de alérgenos',
  sections: [
    {
      id: 'sec-1',
      title: 'Entrantes & Tapas',
      items: [
        {
          id: 'item-1',
          name: 'Croquetas de Jamón Ibérico',
          price: '9.50',
          description: 'Bechamel cremosa, crujiente de panko y velo de jamón (6 uds)',
        },
        {
          id: 'item-2',
          name: 'Burrata Trufada con Tomates Confitados',
          price: '13.00',
          description: 'Pesto artesano de albahaca, piñones tostados y rúcula silvestre',
        },
        {
          id: 'item-3',
          name: 'Tartar de Salmón & Aguacate',
          price: '14.50',
          description: 'Emulsión de soja cítrica, sésamo negro y totopos de maíz',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Platos Principales',
      items: [
        {
          id: 'item-4',
          name: 'Entrecot Madurado a la Brasa (350g)',
          price: '22.00',
          description: 'Con patatas baby rustidas al romero y mantequilla de hierbas',
        },
        {
          id: 'item-5',
          name: 'Lomo de Corvina Salvaje',
          price: '19.50',
          description: 'Sobre crema ligera de hinojo asado y espárragos trigueros',
        },
        {
          id: 'item-6',
          name: 'Arroz Meloso de Boletus & Foie',
          price: '17.50',
          description: 'Arroz bomba de autor con setas silvestres y lascas de parmesano',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Postres Caseros',
      items: [
        {
          id: 'item-7',
          name: 'Tarta de Queso Fluida',
          price: '6.00',
          description: 'Horneada a diario con queso crema del país y corazón fundente',
        },
        {
          id: 'item-8',
          name: 'Torrija Caramelizada en Pan Brioche',
          price: '5.50',
          description: 'Empapada en leche merengada con helado artesano de vainilla Bourbon',
        },
      ],
    },
  ],
  background: {
    type: 'preset',
    presetId: 'pizarra',
    color: '#18181b',
    overlayOpacity: 0.25,
    overlayColor: '#000000',
    logoScale: 1.0,
  },
  style: {
    format: '9:16',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    headingFontFamily: "'Playfair Display', serif",
    primaryColor: '#ffffff',
    secondaryColor: '#cbd5e1',
    priceColor: '#fbbf24',
    accentColor: '#f59e0b',
    boxColor: '#000000',
    boxOpacity: 0.45,
    boxRadius: 28,
    leaderStyle: 'dots',
    fontSizeScale: 1.0,
    itemSpacing: 1.0,
    marginScale: 1.0,
    alignment: 'left',
    currency: '€',
    currencyPosition: 'after',
    showSectionDividers: true,
    textShadow: true,
  },
};

type StepId = 1 | 2 | 3 | 4;

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Active menu state with local persistence
  const [menuData, setMenuData] = useState<MenuData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_ACTIVE_DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_MENU_DATA,
            ...parsed,
            background: { ...DEFAULT_MENU_DATA.background, ...(parsed.background || {}) },
            style: { ...DEFAULT_MENU_DATA.style, ...(parsed.style || {}) },
          };
        }
      } catch (err) {
        console.warn('Error loading active menu draft:', err);
      }
    }
    return DEFAULT_MENU_DATA;
  });

  // Saved multi-drafts list
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SAVED_DRAFTS_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error loading drafts list:', err);
      }
    }
    return [];
  });

  // Auto-save active menu draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_DRAFT_KEY, JSON.stringify(menuData));
    } catch (e) {
      console.warn('Could not save draft to local storage:', e);
    }
  }, [menuData]);

  // Persist multi-drafts list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_DRAFTS_KEY, JSON.stringify(savedDrafts));
    } catch (e) {
      console.warn('Could not save drafts list:', e);
    }
  }, [savedDrafts]);

  // Handle updates
  const handleUpdateBackground = (bg: MenuData['background']) => {
    setMenuData((prev) => ({ ...prev, background: bg }));
  };

  const handleUpdateDishes = (partial: Partial<MenuData>) => {
    setMenuData((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdateStyle = (newStyle: MenuData['style']) => {
    setMenuData((prev) => ({ ...prev, style: newStyle }));
  };

  // Draft management
  const handleSaveNewDraft = (name: string) => {
    const newDraft: SavedDraft = {
      id: 'draft-' + Date.now(),
      name,
      updatedAt: Date.now(),
      data: JSON.parse(JSON.stringify(menuData)),
    };
    setSavedDrafts((prev) => [newDraft, ...prev]);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setMenuData(JSON.parse(JSON.stringify(draft.data)));
  };

  const handleDeleteDraft = (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleResetToSample = () => {
    setMenuData(DEFAULT_MENU_DATA);
  };

  const STEPS_CONFIG = [
    { id: 1, label: 'Fondo', icon: ImageIcon, desc: 'Foto, textura o color' },
    { id: 2, label: 'Platos', icon: UtensilsCrossed, desc: 'Nombre, secciones y precios' },
    { id: 3, label: 'Estilo', icon: Palette, desc: 'Fuentes, formato y colores' },
    { id: 4, label: 'Guardar', icon: Download, desc: 'Exporta y comparte' },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950 pb-20 lg:pb-8">
      <OfflineIndicator />
      {/* 1. Header según Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a href="/" className="flex items-center gap-2 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-base shadow-sm">
            C
          </div>
          <div className="leading-tight">
            <span className="text-base font-bold tracking-tight text-neutral-100 group-hover:text-amber-400 transition-colors">
              Carta
            </span>
            <span className="hidden sm:inline text-xs text-neutral-500 ml-2">
              Diseñador de menús
            </span>
          </div>
        </a>

        {/* Zone 2: Step Pills / Indicators */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          {STEPS_CONFIG.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id as StepId)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.id}. {step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Install Button */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            type="button"
            onClick={handleResetToSample}
            className="hidden sm:flex min-h-[40px] px-3 text-xs text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 items-center gap-1.5 transition-colors"
            title="Reiniciar a menú de muestra"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ejemplo</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="min-h-[40px] px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Split View (Responsive Mobile + Desktop) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Desktop) / Top Section (Mobile): Live Preview Canvas */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col items-center space-y-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Vista previa en vivo
              </span>
              <span className="text-[11px] text-amber-400/90 font-mono">
                {menuData.style.format.toUpperCase()} · Auto-guardado
              </span>
            </div>

            <CanvasPreview data={menuData} />

            <p className="text-[11px] text-neutral-500 text-center max-w-xs">
              Mismo renderizador en pantalla y en la imagen final descargada
            </p>
          </div>

          {/* Right Column: Step by step editor */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step navigation tabs for mobile / small screen */}
            <div className="flex md:hidden items-center justify-between gap-1 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-800">
              {STEPS_CONFIG.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id as StepId)}
                    className={`flex-1 min-h-[44px] py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-none">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Header info */}
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                  Paso {currentStep} de 4
                </span>
                <h1 className="text-base sm:text-lg font-bold text-neutral-100">
                  {STEPS_CONFIG[currentStep - 1].label}: {STEPS_CONFIG[currentStep - 1].desc}
                </h1>
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as StepId)}
                  className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-200 flex items-center justify-center transition-colors"
                  title="Paso anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentStep === 4}
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as StepId)}
                  className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-neutral-950 font-bold flex items-center justify-center transition-colors shadow-sm"
                  title="Paso siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-neutral-950">
              {currentStep === 1 && (
                <StepBackground
                  background={menuData.background}
                  onChange={handleUpdateBackground}
                />
              )}

              {currentStep === 2 && (
                <StepDishes
                  data={menuData}
                  onChange={handleUpdateDishes}
                />
              )}

              {currentStep === 3 && (
                <StepStyle
                  style={menuData.style}
                  onChange={handleUpdateStyle}
                />
              )}

              {currentStep === 4 && (
                <StepExport
                  data={menuData}
                  savedDrafts={savedDrafts}
                  onLoadDraft={handleLoadDraft}
                  onSaveNewDraft={handleSaveNewDraft}
                  onDeleteDraft={handleDeleteDraft}
                  onResetToSample={() => setMenuData(DEFAULT_MENU_DATA)}
                />
              )}
            </div>

            {/* Bottom step navigation triggers */}
            <div className="pt-4 flex justify-between items-center border-t border-neutral-800/80">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as StepId)}
                  className="min-h-[44px] px-4 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior: {STEPS_CONFIG[currentStep - 2]?.label ?? ''}</span>
                </button>
              ) : <div />}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as StepId)}
                  className="min-h-[44px] px-5 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 ml-auto"
                >
                  <span>Siguiente: {STEPS_CONFIG[currentStep as 1 | 2 | 3]?.label ?? ''}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[44px] px-4 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-1.5 ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Volver al inicio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Thumb Bar (Anchor) adhering to Section 3: Pattern 1 & 15% Mobile Sticky Cap */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5">
        <div className="grid grid-cols-4 items-center max-w-md mx-auto">
          {STEPS_CONFIG.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id as StepId)}
                className={`min-h-[44px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
