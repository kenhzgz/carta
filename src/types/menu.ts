export type MenuFormat = '9:16' | '4:5' | 'a4' | '1:1';
export type LeaderStyle = 'dots' | 'line' | 'dash' | 'none';
export type TextAlignment = 'left' | 'center';

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  badge?: string; // e.g. "Vegano", "Especialidad", "Nuevo"
}

export interface MenuSection {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
}

export type PresetBackgroundId = 'pizarra' | 'madera' | 'marmol' | 'kraft' | 'esmeralda' | 'terracota';

export interface MenuBackground {
  type: 'preset' | 'color' | 'image';
  presetId: PresetBackgroundId;
  imageUrl?: string; // custom upload or generated
  color: string; // solid color
  overlayOpacity: number; // 0.0 to 0.8
  overlayColor: '#000000' | '#ffffff' | string;
  logoUrl?: string;
  logoScale: number; // 0.5 to 1.5
}

export interface MenuStyle {
  format: MenuFormat;
  fontFamily: string;
  headingFontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  priceColor: string;
  accentColor: string;
  boxColor: string;
  boxOpacity: number;
  boxRadius: number;
  leaderStyle: LeaderStyle;
  fontSizeScale: number; // 0.8 to 1.3
  itemSpacing: number; // multiplier 0.8 to 1.4
  marginScale: number; // 0.7 to 1.3
  alignment: TextAlignment;
  currency: string;
  currencyPosition: 'after' | 'before';
  showSectionDividers: boolean;
  textShadow: boolean;
}

export interface MenuData {
  title: string;
  subtitle: string;
  footer: string;
  sections: MenuSection[];
  background: MenuBackground;
  style: MenuStyle;
}

export interface SavedDraft {
  id: string;
  name: string;
  updatedAt: number;
  data: MenuData;
}
