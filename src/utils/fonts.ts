export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  category: 'Moderno' | 'Elegante' | 'Rústico' | 'Urbano';
  description: string;
}

export const MENU_FONTS: FontDefinition[] = [
  // Modernos
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", category: 'Moderno', description: 'Limpio y legible' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'Moderno', description: 'Geométrico actual' },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'Moderno', description: 'Minimalista refinado' },
  { id: 'dm-sans', name: 'DM Sans', family: "'DM Sans', sans-serif", category: 'Moderno', description: 'Bistró contemporáneo' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Moderno', description: 'Sólido y estructurado' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'Moderno', description: 'Redondeado y amable' },

  // Elegantes / Gourmet
  { id: 'playfair-display', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Elegante', description: 'Alta cocina clásica' },
  { id: 'cormorant-garamond', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Elegante', description: 'Lujo y distinción' },
  { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif", category: 'Elegante', description: 'Clásico romano majestuoso' },
  { id: 'lora', name: 'Lora', family: "'Lora', serif", category: 'Elegante', description: 'Editorial cálido' },
  { id: 'bodoni-moda', name: 'Bodoni Moda', family: "'Bodoni Moda', serif", category: 'Elegante', description: 'Elegancia y contraste' },

  // Rústicos / Artesanales
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", category: 'Rústico', description: 'Pizarra hecha a mano' },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", category: 'Rústico', description: 'Retro y desenfadado' },
  { id: 'courier-prime', name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'Rústico', description: 'Máquina de escribir vintage' },

  // Urbanos / Fuertes
  { id: 'bebas-neue', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'Urbano', description: 'Mayúsculas de impacto' },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif", category: 'Urbano', description: 'Condensado tipo cervecería' },
];
