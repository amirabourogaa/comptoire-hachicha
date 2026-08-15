/**
 * Extract dominant colors from an image URL using Canvas pixel analysis.
 * Returns HSL strings compatible with the theme system.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToString(hsl: HSL): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * Simple k-means clustering to find dominant colors
 */
function kMeans(pixels: RGB[], k: number, iterations = 10): RGB[] {
  if (pixels.length === 0) return [];
  
  // Initialize centroids by picking evenly spaced pixels
  const step = Math.max(1, Math.floor(pixels.length / k));
  let centroids = Array.from({ length: k }, (_, i) => ({ ...pixels[Math.min(i * step, pixels.length - 1)] }));

  for (let iter = 0; iter < iterations; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    
    for (const px of pixels) {
      let minDist = Infinity, closest = 0;
      for (let c = 0; c < k; c++) {
        const d = colorDistance(px, centroids[c]);
        if (d < minDist) { minDist = d; closest = c; }
      }
      clusters[closest].push(px);
    }

    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;
      centroids[c] = {
        r: Math.round(clusters[c].reduce((s, p) => s + p.r, 0) / clusters[c].length),
        g: Math.round(clusters[c].reduce((s, p) => s + p.g, 0) / clusters[c].length),
        b: Math.round(clusters[c].reduce((s, p) => s + p.b, 0) / clusters[c].length),
      };
    }
  }

  return centroids;
}

/**
 * Load image and extract pixel data
 */
function getPixels(imageUrl: string): Promise<RGB[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 100; // downsample for speed
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      
      const pixels: RGB[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        // Skip fully transparent and near-white/near-black background pixels
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness > 248 || brightness < 7) continue;
        pixels.push({ r, g, b });
      }
      resolve(pixels);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

export interface ExtractedColors {
  dominant: HSL;
  secondary: HSL;
  accent: HSL;
  dark: HSL;
  light: HSL;
}

/**
 * Extract the 5 most dominant colors from an image
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  const pixels = await getPixels(imageUrl);
  
  if (pixels.length < 5) {
    // Fallback if image is mostly transparent/white
    return {
      dominant: { h: 220, s: 60, l: 40 },
      secondary: { h: 220, s: 20, l: 90 },
      accent: { h: 35, s: 70, l: 50 },
      dark: { h: 220, s: 30, l: 12 },
      light: { h: 220, s: 15, l: 96 },
    };
  }

  const clusters = kMeans(pixels, 5);
  const hslColors = clusters.map(rgbToHsl);
  
  // Sort by saturation * (distance from gray) to get most "colorful" first
  hslColors.sort((a, b) => (b.s * Math.abs(b.l - 50)) - (a.s * Math.abs(a.l - 50)));

  const dominant = hslColors[0];
  const secondary = hslColors[1] || hslColors[0];
  const accent = hslColors[2] || hslColors[0];

  return {
    dominant,
    secondary,
    accent,
    dark: { h: dominant.h, s: Math.min(dominant.s, 30), l: 12 },
    light: { h: dominant.h, s: Math.max(10, Math.min(dominant.s, 20)), l: 96 },
  };
}

/**
 * Generate a full ThemeSettings-compatible color palette from extracted colors
 */
export function generateThemeFromColors(colors: ExtractedColors) {
  const { dominant, secondary, accent, dark, light } = colors;

  return {
    primary: hslToString({ h: dominant.h, s: Math.min(dominant.s + 10, 100), l: Math.max(25, Math.min(dominant.l, 45)) }),
    secondary: hslToString({ h: secondary.h, s: Math.max(10, Math.min(secondary.s, 30)), l: 92 }),
    accent: hslToString({ h: accent.h, s: Math.min(accent.s + 15, 80), l: Math.max(40, Math.min(accent.l, 65)) }),
    background: hslToString(light),
    foreground: hslToString(dark),
    muted: hslToString({ h: dominant.h, s: Math.max(5, Math.min(dominant.s, 15)), l: 93 }),
    card: hslToString({ h: dominant.h, s: Math.max(8, Math.min(dominant.s, 18)), l: 97 }),
    border: hslToString({ h: dominant.h, s: Math.max(8, Math.min(dominant.s, 18)), l: 88 }),
    gold: hslToString({ h: accent.h > 20 && accent.h < 50 ? accent.h : 38, s: 65, l: 55 }),
    navbarBg: hslToString({ h: dominant.h, s: Math.min(dominant.s, 35), l: 15 }),
    navbarText: hslToString({ h: dominant.h, s: Math.max(10, Math.min(dominant.s, 25)), l: 94 }),
  };
}
