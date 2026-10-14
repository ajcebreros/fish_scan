import type {
  FishSpecies,
  ScanResult,
  PossibleMatch,
  IdentificationClue,
} from '@/types';
import { FISH_DATABASE } from '@/data/fishDatabase';

const UNCERTAINTY_THRESHOLD = 82;

const SPECIES_PROFILES: Record<
  string,
  {
    dominantColors: string[];
    bodyShape: 'elongated' | 'deep' | 'balanced';
    preferredAspect: [number, number];
    preferredCoverage: [number, number];
    shouldHaveSilver: boolean;
    shouldHaveYellow: boolean;
    shouldHaveRed: boolean;
    shouldHaveSpots: boolean;
  }
> = {
  bangus: {
    dominantColors: ['silver', 'blue'],
    bodyShape: 'elongated',
    preferredAspect: [1.8, 3.8],
    preferredCoverage: [0.18, 0.45],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  'yellowfin-tuna': {
    dominantColors: ['blue', 'yellow', 'silver'],
    bodyShape: 'elongated',
    preferredAspect: [1.7, 3.6],
    preferredCoverage: [0.2, 0.5],
    shouldHaveSilver: true,
    shouldHaveYellow: true,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  'skipjack-tuna': {
    dominantColors: ['blue', 'silver'],
    bodyShape: 'elongated',
    preferredAspect: [1.8, 3.4],
    preferredCoverage: [0.2, 0.5],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  'bigeye-tuna': {
    dominantColors: ['blue', 'yellow', 'silver'],
    bodyShape: 'deep',
    preferredAspect: [1.2, 2.3],
    preferredCoverage: [0.25, 0.55],
    shouldHaveSilver: true,
    shouldHaveYellow: true,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  'lapu-lapu': {
    dominantColors: ['red', 'green', 'gray'],
    bodyShape: 'deep',
    preferredAspect: [0.9, 1.9],
    preferredCoverage: [0.22, 0.52],
    shouldHaveSilver: false,
    shouldHaveYellow: false,
    shouldHaveRed: true,
    shouldHaveSpots: true,
  },
  'maya-maya': {
    dominantColors: ['red', 'pink', 'silver'],
    bodyShape: 'deep',
    preferredAspect: [0.9, 1.7],
    preferredCoverage: [0.22, 0.5],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: true,
    shouldHaveSpots: false,
  },
  galunggong: {
    dominantColors: ['silver', 'blue', 'green'],
    bodyShape: 'elongated',
    preferredAspect: [1.9, 4.2],
    preferredCoverage: [0.2, 0.42],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  tamban: {
    dominantColors: ['silver', 'blue', 'green'],
    bodyShape: 'elongated',
    preferredAspect: [2.0, 4.6],
    preferredCoverage: [0.18, 0.4],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  tilapia: {
    dominantColors: ['green', 'gray'],
    bodyShape: 'deep',
    preferredAspect: [0.9, 1.8],
    preferredCoverage: [0.24, 0.54],
    shouldHaveSilver: false,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  talakitok: {
    dominantColors: ['silver', 'blue', 'green'],
    bodyShape: 'deep',
    preferredAspect: [1.1, 2.3],
    preferredCoverage: [0.22, 0.54],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  pompano: {
    dominantColors: ['silver', 'yellow'],
    bodyShape: 'deep',
    preferredAspect: [1.0, 1.8],
    preferredCoverage: [0.25, 0.56],
    shouldHaveSilver: true,
    shouldHaveYellow: true,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  },
  butanding: {
    dominantColors: ['blue', 'gray', 'white'],
    bodyShape: 'balanced',
    preferredAspect: [0.7, 1.4],
    preferredCoverage: [0.32, 0.68],
    shouldHaveSilver: false,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: true,
  },
};

interface ImageMetrics {
  imageWidth: number;
  imageHeight: number;
  objectWidth: number;
  objectHeight: number;
  brightness: number;
  saturation: number;
  contrast: number;
  aspectRatio: number;
  objectCoverage: number;
  centerFocus: number;
  silver: number;
  blue: number;
  yellow: number;
  red: number;
  green: number;
  gray: number;
  dark: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseCentimetersFromRange(text: string): number {
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:cm|centimeter|centimetres|in|inch|inches|m|meter|meters|ft|feet|foot)/gi)]
    .map((match) => match[1])
    .map((value) => Number(value));

  if (matches.length === 0) {
    return 35;
  }

  const valuesInCm = matches.map((value) => {
    const lower = text.toLowerCase();
    const isInches = /\bin\b|\binches\b/.test(lower);
    const isMeters = /\bm\b|\bmeters\b|\bmeter\b/.test(lower);
    const isFeet = /\bft\b|\bfeet\b|\bfoot\b/.test(lower);

    if (isFeet) return value * 30.48;
    if (isInches) return value * 2.54;
    if (isMeters) return value * 100;
    return value;
  });

  return Math.max(...valuesInCm);
}

function toBaseColorBuckets(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const brightness = (r + g + b) / 3;
  const saturation = max === 0 ? 0 : delta / max;

  if (brightness < 60) return 'dark';
  if (saturation < 0.14 && brightness > 120) return 'silver';

  const hue = (() => {
    if (max === min) return 0;
    const d = max - min;
    if (max === r) return ((g - b) / d) % 6;
    if (max === g) return (b - r) / d + 2;
    return (r - g) / d + 4;
  })();

  const h = ((hue * 60) + 360) % 360;

  if (h >= 40 && h <= 80) return 'yellow';
  if (h >= 0 && h <= 20) return 'red';
  if (h >= 150 && h <= 220) return 'blue';
  if (h >= 80 && h <= 150) return 'green';
  if (h >= 220 && h <= 300) return 'purple';

  return 'gray';
}

async function normalizeImageSource(imageData: string): Promise<string> {
  if (imageData.startsWith('data:') || imageData.startsWith('blob:')) {
    return imageData;
  }

  try {
    const response = await fetch(imageData);
    if (!response.ok) {
      return imageData;
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? imageData));
      reader.onerror = () => reject(new Error('Could not read the image source.'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return imageData;
  }
}

function getImageMetrics(imageData: string): Promise<ImageMetrics> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const MAX_SIZE = 96;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas rendering is not available in this browser.'));
        return;
      }

      const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);

      const pixels = context.getImageData(0, 0, width, height).data;
      const pixelCount = width * height;
      const borderRed: number[] = [];
      const borderGreen: number[] = [];
      const borderBlue: number[] = [];
      const borderWidth = Math.max(2, Math.round(Math.min(width, height) * 0.05));

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const isBorder =
            x < borderWidth ||
            y < borderWidth ||
            x >= width - borderWidth ||
            y >= height - borderWidth;
          if (!isBorder) continue;

          const idx = (y * width + x) * 4;
          borderRed.push(pixels[idx]);
          borderGreen.push(pixels[idx + 1]);
          borderBlue.push(pixels[idx + 2]);
        }
      }

      const average = (values: number[]) =>
        values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
      const backgroundRed = average(borderRed);
      const backgroundGreen = average(borderGreen);
      const backgroundBlue = average(borderBlue);
      const foregroundMask = new Uint8Array(pixelCount);

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const brightness = (r + g + b) / 3;
          const colorDistance = Math.sqrt(
            (r - backgroundRed) ** 2 +
              (g - backgroundGreen) ** 2 +
              (b - backgroundBlue) ** 2
          );

          if (brightness > 18 && brightness < 252 && colorDistance > 42) {
            foregroundMask[y * width + x] = 1;
          }
        }
      }

      const visited = new Uint8Array(pixelCount);
      let largestComponent: number[] = [];
      for (let start = 0; start < pixelCount; start += 1) {
        if (!foregroundMask[start] || visited[start]) continue;

        const component: number[] = [];
        const queue = [start];
        visited[start] = 1;
        for (let cursor = 0; cursor < queue.length; cursor += 1) {
          const current = queue[cursor];
          component.push(current);
          const x = current % width;
          const y = Math.floor(current / width);
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              if (dx === 0 && dy === 0) continue;
              const nextX = x + dx;
              const nextY = y + dy;
              if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
              const next = nextY * width + nextX;
              if (foregroundMask[next] && !visited[next]) {
                visited[next] = 1;
                queue.push(next);
              }
            }
          }
        }
        if (component.length > largestComponent.length) largestComponent = component;
      }

      const minimumUsefulComponent = Math.max(8, Math.round(pixelCount * 0.015));
      const selectedPixels =
        largestComponent.length >= minimumUsefulComponent
          ? largestComponent
          : Array.from(foregroundMask, (isForeground, index) => isForeground ? index : -1).filter((index) => index >= 0);
      const centerX = width / 2;
      const centerY = height / 2;
      let minX = width;
      let maxX = -1;
      let minY = height;
      let maxY = -1;
      let centerPixels = 0;
      let brightnessTotal = 0;
      let saturationTotal = 0;
      let contrastTotal = 0;
      let silver = 0;
      let blue = 0;
      let yellow = 0;
      let red = 0;
      let green = 0;
      let gray = 0;
      let dark = 0;

      for (const pixel of selectedPixels) {
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const idx = pixel * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const brightness = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const bucket = toBaseColorBuckets(r, g, b);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        if (Math.abs(x - centerX) < width * 0.22 && Math.abs(y - centerY) < height * 0.22) {
          centerPixels += 1;
        }
        brightnessTotal += brightness;
        saturationTotal += saturation;
        contrastTotal += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
        if (bucket === 'silver') silver += 1;
        if (bucket === 'blue') blue += 1;
        if (bucket === 'yellow') yellow += 1;
        if (bucket === 'red') red += 1;
        if (bucket === 'green') green += 1;
        if (bucket === 'gray') gray += 1;
        if (bucket === 'dark') dark += 1;
      }

      const measuredPixelCount = selectedPixels.length;
      const objectWidth = Math.max(1, maxX - minX + 1);
      const objectHeight = Math.max(1, maxY - minY + 1);
      const objectAspect = objectWidth / objectHeight;
      const objectCoverage = measuredPixelCount / pixelCount;
      const centerFocus = measuredPixelCount === 0 ? 0 : centerPixels / measuredPixelCount;

      resolve({
        imageWidth: width,
        imageHeight: height,
        objectWidth,
        objectHeight,
        brightness: measuredPixelCount ? brightnessTotal / measuredPixelCount : 0,
        saturation: measuredPixelCount ? saturationTotal / measuredPixelCount : 0,
        contrast: measuredPixelCount ? contrastTotal / measuredPixelCount : 0,
        aspectRatio: objectAspect,
        objectCoverage,
        centerFocus,
        silver: measuredPixelCount ? silver / measuredPixelCount : 0,
        blue: measuredPixelCount ? blue / measuredPixelCount : 0,
        yellow: measuredPixelCount ? yellow / measuredPixelCount : 0,
        red: measuredPixelCount ? red / measuredPixelCount : 0,
        green: measuredPixelCount ? green / measuredPixelCount : 0,
        gray: measuredPixelCount ? gray / measuredPixelCount : 0,
        dark: measuredPixelCount ? dark / measuredPixelCount : 0,
      });
    };

    img.onerror = () => reject(new Error('Could not load the fish image.'));
    img.src = imageData;
  });
}

function buildClues(primary: FishSpecies, metrics: ImageMetrics): IdentificationClue[] {
  const base = primary.physicalCharacteristics.distinctiveFeatures.slice(0, 4);
  const featureHints = [
    metrics.aspectRatio > 1.6 ? 'Elongated body profile' : metrics.aspectRatio > 1.2 ? 'Moderately streamlined shape' : 'Compact rounded body',
    metrics.yellow > 0.08 ? 'Warm yellow accents are visible' : metrics.red > 0.08 ? 'Red/pink tones present' : 'Cool silver-blue palette dominates',
    metrics.objectCoverage > 0.25 ? 'Strong central fish silhouette' : 'Partially obscured fish outline',
    primary.physicalCharacteristics.coloration,
  ];

  return base.map((feature, index) => ({
    feature: featureHints[index] ?? 'Visible catch detail',
    description: feature,
    confidence: clamp(70 + index * 7 + Math.round(metrics.centerFocus * 25), 60, 98),
  }));
}

function estimateLengthCm(species: FishSpecies, metrics: ImageMetrics): number {
  const speciesMaxCm = parseCentimetersFromRange(species.physicalCharacteristics.maxSize);
  const bodyLengthRatio = clamp(
    Math.max(metrics.objectWidth, metrics.objectHeight * metrics.aspectRatio) /
      Math.max(metrics.imageWidth, metrics.imageHeight),
    0.08,
    0.95
  );

  const bodyShapeMultiplier =
    species.physicalCharacteristics.bodyShape.toLowerCase().includes('elongated')
      ? 1.24
      : species.physicalCharacteristics.bodyShape.toLowerCase().includes('deep')
      ? 1.08
      : 1.0;

  const coverageBias = 0.8 + metrics.objectCoverage * 0.9;
  const estimate = speciesMaxCm * bodyLengthRatio * bodyShapeMultiplier * coverageBias * 0.9;

  return clamp(Math.round(estimate), 8, Math.max(12, Math.round(speciesMaxCm * 0.9)));
}

function scoreSpecies(species: FishSpecies, metrics: ImageMetrics) {
  const profile = SPECIES_PROFILES[species.id] ?? {
    dominantColors: ['silver'],
    bodyShape: 'balanced' as const,
    preferredAspect: [0.8, 2.2] as [number, number],
    preferredCoverage: [0.18, 0.55] as [number, number],
    shouldHaveSilver: true,
    shouldHaveYellow: false,
    shouldHaveRed: false,
    shouldHaveSpots: false,
  };

  const colorWeights: Record<string, number> = {
    silver: 28,
    blue: 24,
    yellow: 26,
    red: 24,
    green: 18,
    gray: 14,
  };

  let score = 18;

  const colorEntries = [
    ['silver', metrics.silver],
    ['blue', metrics.blue],
    ['yellow', metrics.yellow],
    ['red', metrics.red],
    ['green', metrics.green],
    ['gray', metrics.gray],
  ] as const;

  const dominantMatch = profile.dominantColors.reduce((total, color) => {
    const value = metrics[color as keyof typeof metrics] ?? 0;
    return total + value * (colorWeights[color] ?? 18);
  }, 0);

  const dominantColorStrength =
    profile.dominantColors.reduce((total, color) => total + (metrics[color as keyof typeof metrics] ?? 0), 0) /
    Math.max(profile.dominantColors.length, 1);

  const nonDominantPenalty = colorEntries.reduce((total, [color, value]) => {
    if (profile.dominantColors.includes(color)) {
      return total;
    }
    return total + value * (colorWeights[color] ?? 12);
  }, 0);

  score += clamp(dominantMatch * 18, 0, 26);
  score += clamp((dominantColorStrength - 0.12) * 24, -12, 18);
  score -= clamp(nonDominantPenalty * 16, 0, 18);

  const strongWrongColorPenalty = colorEntries.reduce((total, [color, value]) => {
    if (profile.dominantColors.includes(color)) {
      return total;
    }
    return total + (value > 0.18 ? value * 26 : 0);
  }, 0);
  score -= clamp(strongWrongColorPenalty, 0, 24);

  if (profile.shouldHaveSilver) {
    score += metrics.silver > 0.12 ? 16 : -18;
  } else if (metrics.silver > 0.22) {
    score -= 18;
  }

  if (profile.shouldHaveYellow) {
    score += metrics.yellow > 0.08 ? 16 : -14;
  } else if (metrics.yellow > 0.16) {
    score -= 18;
  }

  if (profile.shouldHaveRed) {
    score += metrics.red > 0.08 ? 16 : -14;
  } else if (metrics.red > 0.18) {
    score -= 18;
  }

  if (profile.shouldHaveSpots) {
    score += metrics.gray > 0.06 ? 10 : -8;
  } else if (metrics.gray > 0.22 && species.id !== 'lapu-lapu') {
    score -= 12;
  }

  const [minAspect, maxAspect] = profile.preferredAspect;
  const aspectMid = (minAspect + maxAspect) / 2;
  const aspectDistance = Math.abs(metrics.aspectRatio - aspectMid);
  const aspectMatchBonus = clamp((1 - aspectDistance / 1.8) * 24, -18, 24);
  score += aspectMatchBonus;

  const [minCoverage, maxCoverage] = profile.preferredCoverage;
  const coverageMid = (minCoverage + maxCoverage) / 2;
  const coverageDistance = Math.abs(metrics.objectCoverage - coverageMid);
  const coverageMatchBonus = clamp((1 - coverageDistance / 0.45) * 18, -12, 18);
  score += coverageMatchBonus;

  if (profile.bodyShape === 'elongated' && metrics.aspectRatio > 1.6) {
    score += 12;
  } else if (profile.bodyShape === 'elongated' && metrics.aspectRatio <= 1.35) {
    score -= 12;
  }

  if (profile.bodyShape === 'deep' && metrics.aspectRatio > 0.9 && metrics.aspectRatio < 1.7) {
    score += 12;
  } else if (profile.bodyShape === 'deep' && metrics.aspectRatio < 0.8) {
    score -= 8;
  }

  if (profile.bodyShape === 'balanced' && metrics.aspectRatio > 0.7 && metrics.aspectRatio < 1.4) {
    score += 12;
  } else if (profile.bodyShape === 'balanced' && metrics.aspectRatio > 1.8) {
    score -= 10;
  }

  if (species.id === 'bangus') {
    if (metrics.silver > 0.18 && metrics.blue > 0.08 && metrics.aspectRatio > 1.8) {
      score += 28;
    }
    if (metrics.yellow > 0.1) {
      score -= 18;
    }
  }

  if (species.id === 'yellowfin-tuna') {
    if (metrics.yellow > 0.08 && metrics.blue > 0.08 && metrics.aspectRatio > 1.4) {
      score += 30;
    }
    if (metrics.green > 0.2) {
      score -= 12;
    }
  }

  if (species.id === 'bigeye-tuna') {
    // Yellow and blue pixels alone are not enough to identify a tuna.
    // Penalize very slender silhouettes, which are more consistent with scad
    // than with the deeper-bodied bigeye tuna profile.
    if (metrics.yellow > 0.06 && metrics.blue > 0.08 && metrics.aspectRatio > 1.0 && metrics.aspectRatio < 1.9) {
      score += 10;
    }
    if (metrics.aspectRatio > 2.3) {
      score -= 28;
    }
    if (metrics.red > 0.12) {
      score -= 12;
    }
  }

  if (species.id === 'galunggong') {
    // Galunggong (round scad) is generally a small, slender, silvery fish.
    if (metrics.silver > 0.12 && metrics.aspectRatio > 2.0) {
      score += 22;
    }
    if (metrics.aspectRatio > 2.5 && metrics.yellow < 0.12) {
      score += 8;
    }
  }

  if (species.id === 'tilapia') {
    if (metrics.green > 0.12 && metrics.silver < 0.18 && metrics.aspectRatio > 0.8 && metrics.aspectRatio < 1.8) {
      score += 34;
    }
    if (metrics.red > 0.1 || metrics.yellow > 0.12) {
      score -= 12;
    }
  }

  if (species.id === 'lapu-lapu') {
    if (metrics.red > 0.08 && metrics.gray > 0.1 && metrics.aspectRatio > 0.7 && metrics.aspectRatio < 1.5) {
      score += 30;
    }
    if (metrics.silver > 0.2) {
      score -= 18;
    }
  }

  if (species.id === 'talakitok') {
    if (metrics.silver > 0.15 && metrics.blue > 0.08 && metrics.aspectRatio > 0.9 && metrics.aspectRatio < 2.2) {
      score += 24;
    }
    if (metrics.red > 0.12) {
      score -= 10;
    }
  }

  if (species.id === 'pompano') {
    if (metrics.yellow > 0.06 && metrics.silver > 0.12 && metrics.aspectRatio > 0.9 && metrics.aspectRatio < 1.8) {
      score += 22;
    }
  }

  if (species.id === 'butanding') {
    if (metrics.aspectRatio > 0.7 && metrics.aspectRatio < 1.4 && metrics.objectCoverage > 0.26) {
      score += 26;
    }
    if (metrics.silver > 0.2) {
      score -= 12;
    }
  }

  if (metrics.centerFocus > 0.38) {
    score += 8;
  }

  if (metrics.brightness < 60 && species.id === 'butanding') {
    score += 8;
  }

  if (metrics.dark > 0.45 && species.id === 'lapu-lapu') {
    score += 8;
  }

  if (metrics.objectCoverage < 0.08) {
    score -= 20;
  }

  return clamp(Math.round(score), 0, 100);
}

function createPossibleMatches(
  primaryId: string,
  scoredSpecies: Array<{ species: FishSpecies; score: number }>
): PossibleMatch[] {
  return scoredSpecies
    .filter((entry) => entry.species.id !== primaryId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => ({
      species: entry.species,
      confidence: entry.score,
      reason: `Strong visual similarity in body shape and color profile to ${entry.species.commonName}.`,
    }));
}

export interface AnalyzeOptions {
  simulateUncertain?: boolean;
}

export async function analyzeFishImage(
  imageData: string,
  options?: AnalyzeOptions
): Promise<ScanResult> {
  if (!imageData) {
    throw new Error('No fish image was provided.');
  }

  if (options?.simulateUncertain) {
    const fallback = FISH_DATABASE[0];

    return {
      id: `scan-${Date.now()}`,
      timestamp: Date.now(),
      imageData,
      primaryMatch: fallback,
      confidence: 60,
      identificationClues: [],
      isUncertain: true,
      possibleMatches: [],
    };
  }

  const normalizedImage = await normalizeImageSource(imageData);
  const metrics = await getImageMetrics(normalizedImage);
  const scoredSpecies = FISH_DATABASE.map((species) => ({
    species,
    score: scoreSpecies(species, metrics),
  }));

  const sortedSpecies = scoredSpecies.sort((a, b) => b.score - a.score);

  // Scad and trevally can look similar in these basic color/shape measurements.
  // If talakitok only narrowly beats galunggong, prefer the known scad candidate
  // but clearly mark the result as uncertain instead of presenting a high score.
  const topCandidate = sortedSpecies[0];
  const galunggongCandidate = sortedSpecies.find((entry) => entry.species.id === 'galunggong');
  const ambiguousScadVsTrevally =
    topCandidate?.species.id === 'talakitok' &&
    galunggongCandidate !== undefined &&
    topCandidate.score - galunggongCandidate.score <= 15;

  if (ambiguousScadVsTrevally && galunggongCandidate) {
    sortedSpecies.splice(sortedSpecies.indexOf(galunggongCandidate), 1);
    sortedSpecies.unshift(galunggongCandidate);
  }

  const primary = sortedSpecies[0].species;
  const rawConfidence = sortedSpecies[0].score;
  const secondBest = sortedSpecies[1]?.score ?? 0;
  const scoreGap = Math.max(0, rawConfidence - secondBest);
  const calculatedConfidence = clamp(
    Math.round(rawConfidence - Math.max(0, 12 - scoreGap) * 1.3),
    0,
    100
  );
  const confidence = ambiguousScadVsTrevally
    ? Math.min(calculatedConfidence, 79)
    : calculatedConfidence;
  const isUncertain =
    ambiguousScadVsTrevally ||
    confidence < UNCERTAINTY_THRESHOLD ||
    metrics.objectCoverage < 0.1 ||
    scoreGap < 10;

  const estimatedLengthCm = estimateLengthCm(primary, metrics);

  return {
    id: `scan-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    timestamp: Date.now(),
    imageData,
    primaryMatch: primary,
    confidence,
    estimatedLengthCm,
    identificationClues: buildClues(primary, metrics),
    isUncertain,
    possibleMatches: createPossibleMatches(primary.id, sortedSpecies),
  };
}

export const getConservationColor = (status: string): string => {
  switch (status) {
    case 'Least Concern':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';

    case 'Near Threatened':
      return 'text-amber-600 bg-amber-50 border-amber-200';

    case 'Vulnerable':
      return 'text-orange-600 bg-orange-50 border-orange-200';

    case 'Endangered':
      return 'text-red-600 bg-red-50 border-red-200';

    case 'Critically Endangered':
      return 'text-red-700 bg-red-100 border-red-300';

    case 'Data Deficient':
      return 'text-gray-600 bg-gray-50 border-gray-200';

    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};