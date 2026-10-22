import React, { useState } from 'react';
import { MenuData, MenuItem, MenuSection } from '../types/menu';
import { parseMenuText, SAMPLE_MENU_TEMPLATES } from '../utils/textParser';
import { Plus, Trash2, ArrowUp, ArrowDown, ClipboardList, Sparkles, X } from 'lucide-react';

interface StepDishesProps {
  data: MenuData;
  onChange: (updated: Partial<MenuData>) => void;
}

export const StepDishes: React.FC<StepDishesProps> = ({ data, onChange }) => {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // Header and Footer changes
  const handleTitleChange = (val: string) => onChange({ title: val });
  const handleSubtitleChange = (val: string) => onChange({ subtitle: val });
  const handleFooterChange = (val: string) => onChange({ footer: val });

  // Section actions
  const handleAddSection = () => {
    const newSection: MenuSection = {
      id: 'sec-' + Date.now(),
      title: 'Nueva Sección',
      items: [
        {
          id: 'item-' + Date.now(),
          name: 'Nombre del plato',
          price: '10.00',
          description: 'Ingredientes o descripción breve',
        },
      ],
    };
    onChange({ sections: [...data.sections, newSection] });
  };

  const handleUpdateSectionTitle = (secIndex: number, newTitle: string) => {
    const updated = [...data.sections];
    updated[secIndex] = { ...updated[secIndex], title: newTitle };
    onChange({ sections: updated });
  };

  const handleDeleteSection = (secIndex: number) => {
    const updated = data.sections.filter((_, i) => i !== secIndex);
    onChange({ sections: updated });
  };

  // Dish actions
  const handleAddDish = (secIndex: number) => {
    const updated = [...data.sections];
    const newDish: MenuItem = {
      id: 'dish-' + Date.now(),
      name: '',
      price: '',
      description: '',
    };
    updated[secIndex] = {
      ...updated[secIndex],
      items: [...updated[secIndex].items, newDish],
    };
    onChange({ sections: updated });
  };

  const handleUpdateDish = (secIndex: number, dishIndex: number, field: keyof MenuItem, val: string) => {
    const updated = [...data.sections];
    const secItems = [...updated[secIndex].items];
    secItems[dishIndex] = { ...secItems[dishIndex], [field]: val };
    updated[secIndex] = { ...updated[secIndex], items: secItems };
    onChange({ sections: updated });
  };

  const handleDeleteDish = (secIndex: number, dishIndex: number) => {
    const updated = [...data.sections];
    updated[secIndex] = {
      ...updated[secIndex],
      items: updated[secIndex].items.filter((_, i) => i !== dishIndex),
    };
    onChange({ sections: updated });
  };

  const handleMoveDish = (secIndex: number, dishIndex: number, direction: 'up' | 'down') => {
    const updated = [...data.sections];
    const items = [...updated[secIndex].items];
    const targetIndex = direction === 'up' ? dishIndex - 1 : dishIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[dishIndex];
    items[dishIndex] = items[targetIndex];
    items[targetIndex] = temp;

    updated[secIndex] = { ...updated[secIndex], items };
    onChange({ sections: updated });
  };

  // Bulk import
  const applyBulkText = (text: string) => {
    const parsed = parseMenuText(text);
    if (parsed.length > 0) {
      onChange({ sections: parsed });
    }
    setShowBulkModal(false);
    setBulkInput('');
  };

  const loadSampleTemplate = (tmpl: typeof SAMPLE_MENU_TEMPLATES[0]) => {
    const parsed = parseMenuText(tmpl.rawText);
    onChange({
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      footer: tmpl.footer,
      sections: parsed,
    });
    setShowBulkModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Datos Generales del Restaurante */}
      <section className="p-4 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Cabecera del Menú
          </label>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="min-h-[44px] px-3 py-1 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Pegar lista de golpe</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Nombre del restaurante o local</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ej. BISTRO LAUREL"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Subtítulo o descripción breve</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              placeholder="Ej. Cocina mediterránea & Brasas"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Pie de página (alérgenos, IVA, notas)</label>
            <input
              type="text"
              value={data.footer}
              onChange={(e) => handleFooterChange(e.target.value)}
              placeholder="Ej. Precios con IVA incluido · Pregunte por alérgenos"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/60"
            />
          </div>
        </div>
      </section>

      {/* 2. Secciones y Platos */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Secciones y Platos ({data.sections.length} secciones, {data.sections.reduce((a, s) => a + s.items.length, 0)} platos)
          </span>
          <button
            type="button"
            onClick={handleAddSection}
            className="min-h-[44px] px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Nueva sección</span>
          </button>
        </div>

        {data.sections.map((section, secIdx) => (
          <div
            key={section.id}
            className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3 shadow-sm"
          >
            {/* Cabecera de la sección */}
            <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleUpdateSectionTitle(secIdx, e.target.value)}
                placeholder="Título de la sección (ej. Entrantes, Carnes, Postres)"
                className="flex-1 bg-transparent text-sm font-bold text-amber-400 tracking-wide uppercase focus:outline-none focus:border-b focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteSection(secIdx)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                title="Eliminar sección"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de platos en la sección */}
            <div className="space-y-2.5">
              {section.items.map((item, dishIdx) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateDish(secIdx, dishIdx, 'name', e.target.value)}
                      placeholder="Nombre del plato"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                    />
                    <div className="w-24 relative flex items-center">
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handleUpdateDish(secIdx, dishIdx, 'price', e.target.value)}
                        placeholder="Precio"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-mono text-right placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                      />
                    </div>

                    {/* Ordenar y borrar */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={dishIdx === 0}
                        onClick={() => handleMoveDish(secIdx, dishIdx, 'up')}
                        className="p-1.5 text-neutral-500 hover:text-neutral-200 disabled:opacity-20 rounded"
                        title="Subir"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={dishIdx === section.items.length - 1}
                        onClick={() => handleMoveDish(secIdx, dishIdx, 'down')}
                        className="p-1.5 text-neutral-500 hover:text-neutral-200 disabled:opacity-20 rounded"
                        title="Bajar"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(secIdx, dishIdx)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 rounded"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Descripción opcional */}
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateDish(secIdx, dishIdx, 'description', e.target.value)}
                    placeholder="Descripción opcional (ingredientes, alérgenos, etc.)"
                    className="w-full bg-neutral-900/50 border border-neutral-800/50 rounded-md px-2.5 py-1 text-[11px] text-neutral-400 placeholder:text-neutral-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Añadir plato a esta sección */}
            <button
              type="button"
              onClick={() => handleAddDish(secIdx)}
              className="w-full min-h-[40px] py-2 text-xs bg-neutral-950/50 hover:bg-neutral-800/60 border border-dashed border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Añadir plato a {section.title || 'esta sección'}</span>
            </button>
          </div>
        ))}
      </section>

      {/* Modal: Pegar lista completa de golpe */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-100">Pegar lista de platos de golpe</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Pega tu texto directamente desde WhatsApp, notas o un documento. El sistema detecta automáticamente los títulos de sección, los nombres de platos, los precios y las descripciones.
            </p>

            {/* Botones de plantillas de muestra */}
            <div>
              <span className="text-[11px] text-neutral-400 font-medium block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> O carga un ejemplo completo de carta:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_MENU_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => loadSampleTemplate(tmpl)}
                    className="p-2 text-left bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-xl transition-colors"
                  >
                    <p className="text-xs font-semibold text-neutral-200">{tmpl.name}</p>
                    <p className="text-[10px] text-neutral-500">{tmpl.category}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 block font-medium">Pega tu texto aquí:</label>
              <textarea
                rows={8}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`Entrantes\nCroquetas de jamón ibérico ...... 9.50\nCon bechamel cremosa y panko crujiente\nEnsalada de burrata y tomate ...... 12.00\n\nPrincipales\nEntrecot a la brasa ...... 21.00\nArroz meloso de marisco ...... 16.50\n\nPostres\nTarta de queso casera ...... 5.50`}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/70"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="min-h-[44px] px-4 text-xs font-medium text-neutral-400 hover:text-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!bulkInput.trim()}
                onClick={() => applyBulkText(bulkInput)}
                className="min-h-[44px] px-5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl disabled:opacity-40 transition-colors"
              >
                Procesar y Aplicar Platos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
