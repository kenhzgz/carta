import { MenuItem, MenuSection } from '../types/menu';

/**
 * Intelligent parser for bulk menu text.
 * Handles diverse formats pasted from WhatsApp, notes, PDFs, or menus:
 * - "Croquetas caseras ..... 9.50€"
 * - "Tarta de queso - 5.00"
 * - "12.50  Hamburguesa gourmet"
 * - Descriptions on subsequent lines
 * - Section headers ("Entrantes", "POSTRES", "### Carnes")
 */
export function parseMenuText(rawText: string): MenuSection[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const sections: MenuSection[] = [];
  let currentSection: MenuSection = {
    id: 's-' + Math.random().toString(36).substring(2, 9),
    title: 'Carta',
    items: [],
  };

  // Price matchers:
  // e.g., "12.50€", "12,50 €", "$14.00", "8.50", "15€", "12.00.-"
  const priceEndRegex = /[\s\.\-—_:]*([$€£¥]?\s*\d{1,4}(?:[.,]\d{1,2})?\s*[$€£¥]?)\s*$/i;
  const priceStartRegex = /^([$€£¥]?\s*\d{1,4}(?:[.,]\d{1,2})?\s*[$€£¥]?)\s*[\.\-—_:]*\s+/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is empty or purely markdown decorative line
    if (/^[-=*_]{3,}$/.test(line)) continue;

    // Check price at end
    const endMatch = line.match(priceEndRegex);
    const hasPriceAtEnd = endMatch && endMatch[1] && /\d/.test(endMatch[1]) && (endMatch.index ?? 0) > 0;

    // Check price at start
    const startMatch = !hasPriceAtEnd ? line.match(priceStartRegex) : null;
    const hasPriceAtStart = startMatch && startMatch[1] && /\d/.test(startMatch[1]);

    if (hasPriceAtEnd && endMatch && endMatch.index !== undefined) {
      const rawPrice = endMatch[1].trim();
      let rawName = line.slice(0, endMatch.index).replace(/[\.\-—_:\s]+$/, '').trim();
      rawName = rawName.replace(/^[#*-]\s*/, '').trim();

      // Check if subsequent line is a description (has no price and is not a clear all-caps section header)
      let description = '';
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextHasPrice = priceEndRegex.test(nextLine) && /\d/.test(nextLine);
        const isHeaderLike = nextLine.startsWith('#') || (nextLine.length < 24 && nextLine === nextLine.toUpperCase() && !/[.,]/.test(nextLine));

        if (!nextHasPrice && !isHeaderLike && nextLine.length > 0) {
          description = nextLine.replace(/^[#*-]\s*/, '').trim();
          i++; // Consume description line
        }
      }

      currentSection.items.push({
        id: 'i-' + Math.random().toString(36).substring(2, 9),
        name: rawName || 'Plato sin nombre',
        price: cleanPrice(rawPrice),
        description: description || undefined,
      });
    } else if (hasPriceAtStart && startMatch) {
      const rawPrice = startMatch[1].trim();
      let rawName = line.slice(startMatch[0].length).trim();
      rawName = rawName.replace(/^[#*-]\s*/, '').trim();

      let description = '';
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextHasPrice = priceEndRegex.test(nextLine) && /\d/.test(nextLine);
        if (!nextHasPrice && nextLine.length > 0) {
          description = nextLine.trim();
          i++;
        }
      }

      currentSection.items.push({
        id: 'i-' + Math.random().toString(36).substring(2, 9),
        name: rawName || 'Plato sin nombre',
        price: cleanPrice(rawPrice),
        description: description || undefined,
      });
    } else {
      // Header or category line
      const cleanHeader = line.replace(/^[#*-]\s*/, '').replace(/[:_—]+$/, '').trim();
      if (cleanHeader) {
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          id: 's-' + Math.random().toString(36).substring(2, 9),
          title: cleanHeader,
          items: [],
        };
      }
    }
  }

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{
    id: 's-default',
    title: 'Carta',
    items: [],
  }];
}

function cleanPrice(priceStr: string): string {
  // Extract number with decimal or comma
  const cleaned = priceStr.replace(/[^0-9.,]/g, '').trim();
  return cleaned || '0';
}

export interface MenuPresetTemplate {
  name: string;
  category: string;
  title: string;
  subtitle: string;
  footer: string;
  rawText: string;
}

export const SAMPLE_MENU_TEMPLATES: MenuPresetTemplate[] = [
  {
    name: 'Tapas & Vinos',
    category: 'Taberna Española',
    title: 'Taberna El Mirador',
    subtitle: 'Tapas tradicionales & Vinos de la tierra',
    footer: 'Todos los precios incluyen IVA · Pan y servicio 1.50€',
    rawText: `Entrantes & Para Compartir
Croquetas de Jamón Ibérico ...... 9.50
Bechamel cremosa con jamón de bellota y crujiente de panko (6 uds)
Tabla de Quesos Artesanos ...... 14.00
Selección de 4 quesos con nueces, uvas y mermelada de higos
Ensaladilla Rusa con Ventresca ...... 8.50
Patata pochada, huevo campero y mayonesa suave

Principales de la Casa
Pulpo a la Gallega ...... 18.50
Sobre cama de patata confitada y pimentón de la Vera
Solomillo al Foie ...... 22.00
Medallón de ternera con reducción de Pedro Ximénez
Arroz Meloso de Marisco ...... 16.50
Con gamba roja, calamar fresco y alioli de azafrán

Postres Caseros
Tarta de Queso Fluida ...... 6.00
Horneada diariamente con queso crema y mascarpone
Torrija Caramelizada ...... 5.50
Brioche empapado en leche merengada con helado de vainilla`,
  },
  {
    name: 'Bistró Moderno',
    category: 'Cocina de Autor',
    title: 'Atelier Bistró',
    subtitle: 'Cocina de mercado & Temporada',
    footer: 'Cocina abierta ininterrumpidamente · Carta de alérgenos disponible',
    rawText: `Para Empezar
Tartar de Atún Rojo & Aguacate ...... 15.00
Con emulsión de sésamo tostado y crujiente de alga nori
Burrata Trufada con Tomates Asados ...... 13.50
Pesto de pistacho, rúcula silvestre y reducción balsámica
Alcachofas Confitadas con Cecina ...... 12.00
Plancha a fuego vivo con virutas de cecina de León

Platos Principales
Lomo de Corvina Salvaje ...... 19.50
Con crema de chirivía asada y espárragos trigueros
Entrecot Madurado (350g) ...... 24.00
Carne de vacuno mayor con patatas baby al romero
Gnocchi Artesanos de Bonitato ...... 15.00
Mantequilla de salvia, avellanas tostadas y parmesano 24 meses

Dulces Finales
Coulant de Chocolate Negro 70% ...... 6.50
Con corazón fundido y sorbete de mandarina
Milhojas de Crema & Frambuesas ...... 6.00
Hojaldre invertido crujiente caramelizado al momento`,
  },
  {
    name: 'Pizzería & Pasta',
    category: 'Trattoria Italiana',
    title: 'Trattoria Bella Napoli',
    subtitle: 'Auténtica pizza napolitana al horno de leña',
    footer: 'Masa fermentada 48 horas · Harinas italianas ecológicas',
    rawText: `Antipasti
Bruschetta Tradizionale ...... 7.50
Tomate San Marzano macerado, albahaca fresca y aceite EVO
Carpaccio di Manzo ...... 11.50
Finas láminas de buey con lascas de Parmigiano y alcaparras

Pizze Napoletane
Margherita D.O.P. ...... 10.50
Tomate San Marzano, mozzarella fior di latte y albahaca
Diavola Piccante ...... 13.00
Mozzarella, spianata calabrese picante y orégano fresco
Tartufata con Funghi ...... 14.50
Crema de trufa negra, setas silvestres y queso provolone

Pasta Fresca
Tagliatelle al Ragù Bolognese ...... 12.50
Cocción lenta de carne y verduras según la receta tradicional
Ravioli di Ricotta e Spinaci ...... 13.50
Con salsa suave de mantequilla y salvia fresca

Dolci
Tiramisù Tradizionale ...... 5.50
Savoiardi, café expreso y crema de mascarpone
Panna Cotta con Frutos Rojos ...... 5.00
Vainilla natural de Madagascar y coulis casero`,
  },
];
