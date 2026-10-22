import { MenuData, MenuFormat, PresetBackgroundId } from '../types/menu';

export const FORMAT_DIMENSIONS: Record<MenuFormat, { width: number; height: number; label: string; aspect: string }> = {
  '9:16': { width: 1080, height: 1920, label: 'Historia 9:16', aspect: '9 / 16' },
  '4:5': { width: 1080, height: 1350, label: 'Vertical 4:5', aspect: '4 / 5' },
  'a4': { width: 1240, height: 1754, label: 'A4 Imprimible', aspect: '1240 / 1754' },
  '1:1': { width: 1080, height: 1080, label: 'Cuadrado 1:1', aspect: '1 / 1' },
};

// Image cache to avoid re-decoding images on every single frame render
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

export const PRESET_INFOS: Record<PresetBackgroundId, { name: string; file: string; fallbackColor: string; defaultTheme: 'dark' | 'light' }> = {
  pizarra: { name: 'Pizarra', file: '/textures/bg_pizarra.jpg', fallbackColor: '#1c1e21', defaultTheme: 'dark' },
  madera: { name: 'Madera', file: '/textures/bg_madera.jpg', fallbackColor: '#2d1d13', defaultTheme: 'dark' },
  marmol: { name: 'Mármol', file: '/textures/bg_marmol.jpg', fallbackColor: '#f3f4f6', defaultTheme: 'light' },
  kraft: { name: 'Kraft', file: '/textures/bg_kraft.jpg', fallbackColor: '#bfa07d', defaultTheme: 'dark' },
  esmeralda: { name: 'Esmeralda', file: '/textures/bg_esmeralda.jpg', fallbackColor: '#0c382e', defaultTheme: 'dark' },
  terracota: { name: 'Terracota', file: '/textures/bg_terracota.jpg', fallbackColor: '#78351f', defaultTheme: 'dark' },
};

export async function renderMenuToCanvas(
  canvas: HTMLCanvasElement,
  data: MenuData,
  exportScale: number = 1
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Make sure Google web fonts are loaded if available
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if fonts API is unavailable
    }
  }

  const baseDim = FORMAT_DIMENSIONS[data.style.format] || FORMAT_DIMENSIONS['9:16'];
  const targetWidth = Math.round(baseDim.width * exportScale);
  const targetHeight = Math.round(baseDim.height * exportScale);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.save();
  ctx.scale(exportScale, exportScale);
  const { width, height } = baseDim;

  // 1. Draw Background
  if (data.background.type === 'color') {
    ctx.fillStyle = data.background.color || '#18181b';
    ctx.fillRect(0, 0, width, height);
  } else if (data.background.type === 'image' && data.background.imageUrl) {
    const customImg = await loadImage(data.background.imageUrl);
    if (customImg) {
      drawCoverImage(ctx, customImg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#1e1e24';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // Preset texture
    const presetId = data.background.presetId || 'pizarra';
    const preset = PRESET_INFOS[presetId] || PRESET_INFOS.pizarra;
    const presetImg = await loadImage(preset.file);

    if (presetImg) {
      drawCoverImage(ctx, presetImg, 0, 0, width, height);
    } else {
      // Procedural fallback texture
      drawProceduralTexture(ctx, presetId, width, height);
    }
  }

  // 2. Darken / Lighten Tint Overlay
  if (data.background.overlayOpacity > 0) {
    ctx.fillStyle = data.background.overlayColor || '#000000';
    ctx.globalAlpha = Math.min(Math.max(data.background.overlayOpacity, 0), 1);
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
  }

  // 3. Layout geometry calculation
  const marginScale = data.style.marginScale || 1.0;
  const marginX = Math.round(70 * marginScale);
  const marginY = Math.round(60 * marginScale);

  const cardWidth = width - marginX * 2;
  const cardHeight = height - marginY * 2;

  // 4. Translucent Box / Card (if opacity > 0)
  if (data.style.boxOpacity > 0) {
    ctx.save();
    ctx.fillStyle = data.style.boxColor || '#000000';
    ctx.globalAlpha = data.style.boxOpacity;
    const radius = data.style.boxRadius ?? 28;

    if (data.style.textShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
    }

    drawRoundedRect(ctx, marginX, marginY, cardWidth, cardHeight, radius);
    ctx.fill();
    ctx.restore();
  }

  // Content boundaries
  const paddingX = Math.round(48 * marginScale);
  const contentX = marginX + paddingX;
  const contentWidth = cardWidth - paddingX * 2;
  let currentY = marginY + Math.round(50 * marginScale);

  // Text Shadow setup helper
  const applyTextShadow = () => {
    if (data.style.textShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  };

  // 5. Logo (if provided)
  if (data.background.logoUrl) {
    const logoImg = await loadImage(data.background.logoUrl);
    if (logoImg) {
      const baseSize = 110 * (data.background.logoScale || 1.0);
      const aspect = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
      const logoW = aspect >= 1 ? baseSize : baseSize * aspect;
      const logoH = aspect >= 1 ? baseSize / aspect : baseSize;
      const logoX = width / 2 - logoW / 2;

      ctx.save();
      if (data.style.textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 6;
      }
      ctx.drawImage(logoImg, logoX, currentY, logoW, logoH);
      ctx.restore();
      currentY += logoH + 20;
    }
  }

  // 6. Header: Title and Subtitle
  const scale = data.style.fontSizeScale || 1.0;
  const headingFont = data.style.headingFontFamily || data.style.fontFamily || "'Playfair Display', serif";
  const bodyFont = data.style.fontFamily || "'Plus Jakarta Sans', sans-serif";

  applyTextShadow();

  if (data.title && data.title.trim().length > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = data.style.primaryColor;
    const titleSize = Math.round(46 * scale);
    ctx.font = `700 ${titleSize}px ${headingFont}`;

    const maxTitleW = contentWidth - 40;
    const lines = wrapText(ctx, data.title.toUpperCase(), maxTitleW);
    for (const line of lines) {
      ctx.fillText(line, width / 2, currentY + titleSize * 0.85);
      currentY += titleSize * 1.05;
    }
    currentY += 8;
  }

  if (data.subtitle && data.subtitle.trim().length > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = data.style.secondaryColor;
    const subSize = Math.round(22 * scale);
    ctx.font = `400 italic ${subSize}px ${bodyFont}`;

    const subLines = wrapText(ctx, data.subtitle, contentWidth - 60);
    for (const sLine of subLines) {
      ctx.fillText(sLine, width / 2, currentY + subSize * 0.85);
      currentY += subSize * 1.25;
    }
    currentY += 12;
  }

  // Header Divider
  if (data.style.showSectionDividers) {
    ctx.save();
    ctx.strokeStyle = data.style.accentColor || data.style.secondaryColor;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.5;
    const divWidth = Math.min(contentWidth * 0.5, 260);
    ctx.beginPath();
    ctx.moveTo(width / 2 - divWidth / 2, currentY);
    ctx.lineTo(width / 2 + divWidth / 2, currentY);
    ctx.stroke();
    // Center diamond or dot ornament
    ctx.fillStyle = data.style.accentColor || data.style.primaryColor;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(width / 2, currentY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    currentY += 28;
  } else {
    currentY += 16;
  }

  // 7. Multi-column decision:
  // For A4 or wide formats with many items (>8 items and 2+ sections), 2 columns look stunning!
  const totalItems = data.sections.reduce((acc, s) => acc + s.items.length, 0);
  const useTwoColumns = data.style.format === 'a4' && totalItems >= 6 && data.sections.length >= 2;

  const itemSpacing = data.style.itemSpacing || 1.0;
  const footerReservedHeight = data.footer ? 80 : 40;
  const availableContentHeight = (height - marginY) - footerReservedHeight - currentY;

  if (useTwoColumns) {
    const colGap = 44;
    const colWidth = (contentWidth - colGap) / 2;
    const midIndex = Math.ceil(data.sections.length / 2);
    const col1Sections = data.sections.slice(0, midIndex);
    const col2Sections = data.sections.slice(midIndex);

    const startY = currentY;
    renderSectionColumn(ctx, col1Sections, contentX, startY, colWidth, scale, itemSpacing, data, headingFont, bodyFont);
    renderSectionColumn(ctx, col2Sections, contentX + colWidth + colGap, startY, colWidth, scale, itemSpacing, data, headingFont, bodyFont);
  } else {
    // Single Column
    // Dynamic item budget to avoid overflow
    let adjustedItemSpacing = itemSpacing;
    if (totalItems > 12) {
      adjustedItemSpacing = Math.max(0.7, itemSpacing * 0.85);
    }
    renderSectionColumn(ctx, data.sections, contentX, currentY, contentWidth, scale, adjustedItemSpacing, data, headingFont, bodyFont);
  }

  // 8. Footer Notice
  if (data.footer && data.footer.trim().length > 0) {
    applyTextShadow();
    ctx.textAlign = 'center';
    ctx.fillStyle = data.style.secondaryColor;
    const footerSize = Math.max(14, Math.round(18 * scale * 0.85));
    ctx.font = `400 ${footerSize}px ${bodyFont}`;
    const footerY = height - marginY - 24;
    ctx.fillText(data.footer, width / 2, footerY);
  }

  ctx.restore();
}

function renderSectionColumn(
  ctx: CanvasRenderingContext2D,
  sections: MenuData['sections'],
  startX: number,
  startY: number,
  colWidth: number,
  scale: number,
  itemSpacing: number,
  data: MenuData,
  headingFont: string,
  bodyFont: string
): number {
  let y = startY;

  for (const section of sections) {
    // Section Header
    if (section.title && section.title.trim().length > 0) {
      ctx.textAlign = data.style.alignment === 'center' ? 'center' : 'left';
      ctx.fillStyle = data.style.primaryColor;
      const secSize = Math.round(26 * scale);
      ctx.font = `700 ${secSize}px ${headingFont}`;

      const secX = data.style.alignment === 'center' ? startX + colWidth / 2 : startX;
      ctx.fillText(section.title.toUpperCase(), secX, y + secSize * 0.8);
      y += secSize + 6;

      // Section divider underline
      if (data.style.showSectionDividers) {
        ctx.save();
        ctx.strokeStyle = data.style.accentColor || data.style.secondaryColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (data.style.alignment === 'center') {
          const w = Math.min(colWidth * 0.6, 200);
          ctx.moveTo(secX - w / 2, y);
          ctx.lineTo(secX + w / 2, y);
        } else {
          ctx.moveTo(startX, y);
          ctx.lineTo(startX + colWidth, y);
        }
        ctx.stroke();
        ctx.restore();
        y += 18 * itemSpacing;
      } else {
        y += 12 * itemSpacing;
      }
    }

    // Dishes
    for (const item of section.items) {
      const priceText = formatPrice(item.price, data.style.currency, data.style.currencyPosition);
      const nameSize = Math.round(21 * scale);
      const priceSize = Math.round(21 * scale);

      ctx.font = `600 ${nameSize}px ${bodyFont}`;
      const nameWidth = ctx.measureText(item.name).width;

      ctx.font = `700 ${priceSize}px ${bodyFont}`;
      const priceWidth = ctx.measureText(priceText).width;

      const rightEdge = startX + colWidth;

      // Draw Dish Name
      ctx.textAlign = 'left';
      ctx.fillStyle = data.style.primaryColor;
      ctx.font = `600 ${nameSize}px ${bodyFont}`;

      // If name is too long for line + price, wrap or truncate gracefully
      const maxNameWidth = colWidth - priceWidth - 28;
      let displayName = item.name;
      if (nameWidth > maxNameWidth && maxNameWidth > 80) {
        displayName = truncateText(ctx, item.name, maxNameWidth);
      }
      ctx.fillText(displayName, startX, y + nameSize * 0.8);

      // Draw Price aligned to the right
      if (priceText) {
        ctx.textAlign = 'right';
        ctx.fillStyle = data.style.priceColor;
        ctx.font = `700 ${priceSize}px ${bodyFont}`;
        ctx.fillText(priceText, rightEdge, y + priceSize * 0.8);
      }

      // Draw Leader (dots, line, dash)
      if (data.style.leaderStyle !== 'none' && priceText) {
        const actualNameW = ctx.measureText(displayName).width;
        const leaderStartX = startX + actualNameW + 12;
        const leaderEndX = rightEdge - priceWidth - 12;

        if (leaderEndX > leaderStartX + 16) {
          ctx.save();
          ctx.strokeStyle = data.style.secondaryColor;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 1.2;

          if (data.style.leaderStyle === 'dots') {
            ctx.setLineDash([2, 8]);
          } else if (data.style.leaderStyle === 'dash') {
            ctx.setLineDash([6, 6]);
          } else {
            ctx.setLineDash([]);
          }

          const leaderY = y + nameSize * 0.72;
          ctx.beginPath();
          ctx.moveTo(leaderStartX, leaderY);
          ctx.lineTo(leaderEndX, leaderY);
          ctx.stroke();
          ctx.restore();
        }
      }

      y += nameSize + 5;

      // Description (if present)
      if (item.description && item.description.trim().length > 0) {
        ctx.textAlign = 'left';
        ctx.fillStyle = data.style.secondaryColor;
        const descSize = Math.max(12, Math.round(15 * scale));
        ctx.font = `400 ${descSize}px ${bodyFont}`;

        const descMaxW = colWidth - (data.style.leaderStyle !== 'none' ? 10 : 0);
        const descLines = wrapText(ctx, item.description, descMaxW);

        for (const dLine of descLines) {
          ctx.fillText(dLine, startX, y + descSize * 0.8);
          y += descSize * 1.25;
        }
      }

      y += Math.round(14 * itemSpacing);
    }

    y += Math.round(20 * itemSpacing);
  }

  return y;
}

function formatPrice(price: string, currency: string, position: 'after' | 'before'): string {
  if (!price || price.trim().length === 0) return '';
  const trimmed = price.trim();
  if (position === 'before') {
    return `${currency} ${trimmed}`;
  }
  return `${trimmed} ${currency}`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.trim() + '...';
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sourceX = 0;
  let sourceY = 0;
  let sourceW = imgW;
  let sourceH = imgH;

  if (imgRatio > targetRatio) {
    sourceW = imgH * targetRatio;
    sourceX = (imgW - sourceW) / 2;
  } else {
    sourceH = imgW / targetRatio;
    sourceY = (imgH - sourceH) / 2;
  }

  ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, x, y, w, h);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawProceduralTexture(
  ctx: CanvasRenderingContext2D,
  presetId: PresetBackgroundId,
  width: number,
  height: number
) {
  const grad = ctx.createLinearGradient(0, 0, width, height);

  switch (presetId) {
    case 'pizarra':
      grad.addColorStop(0, '#1c1f24');
      grad.addColorStop(0.5, '#16181b');
      grad.addColorStop(1, '#0f1113');
      break;
    case 'madera':
      grad.addColorStop(0, '#3a2417');
      grad.addColorStop(0.5, '#28170c');
      grad.addColorStop(1, '#1b0e06');
      break;
    case 'marmol':
      grad.addColorStop(0, '#f9fafb');
      grad.addColorStop(0.5, '#f3f4f6');
      grad.addColorStop(1, '#e5e7eb');
      break;
    case 'kraft':
      grad.addColorStop(0, '#caa780');
      grad.addColorStop(0.5, '#b9956d');
      grad.addColorStop(1, '#9f7850');
      break;
    case 'esmeralda':
      grad.addColorStop(0, '#093c31');
      grad.addColorStop(0.5, '#052921');
      grad.addColorStop(1, '#021813');
      break;
    case 'terracota':
      grad.addColorStop(0, '#8d3b23');
      grad.addColorStop(0.5, '#732c18');
      grad.addColorStop(1, '#501c0d');
      break;
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle procedural grain
  ctx.save();
  ctx.fillStyle = presetId === 'marmol' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const rw = 2 + Math.random() * 8;
    const rh = 1 + Math.random() * 3;
    ctx.fillRect(rx, ry, rw, rh);
  }
  ctx.restore();
}
