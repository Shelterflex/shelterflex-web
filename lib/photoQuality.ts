/**
 * Checks a listing photo before it is uploaded, so reporters learn straight
 * away that a photo won't do. The API repeats the resolution check; blur and
 * exposure are only checked here.
 */

export const MIN_LONG_SIDE = 1200;
export const MIN_SHORT_SIDE = 900;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Below this, the downscaled photo has too little edge detail to be in focus. */
const MIN_SHARPNESS = 35;
const MIN_BRIGHTNESS = 45;
const MAX_BRIGHTNESS = 225;
const ANALYSIS_LONG_SIDE = 512;

export function checkDimensions(width: number, height: number): string | null {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  if (long < MIN_LONG_SIDE || short < MIN_SHORT_SIDE) {
    return `is too small (${width}×${height}). Use a photo of at least ${MIN_LONG_SIDE}×${MIN_SHORT_SIDE} pixels.`;
  }
  return null;
}

/** Variance of the Laplacian: high for crisp edges, low for blur. */
export function laplacianVariance(gray: ArrayLike<number>, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const v =
        gray[i - width]! + gray[i + width]! + gray[i - 1]! + gray[i + 1]! - 4 * gray[i]!;
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

export function averageBrightness(gray: ArrayLike<number>): number {
  let total = 0;
  for (let i = 0; i < gray.length; i++) total += gray[i]!;
  return total / gray.length;
}

export function checkExposure(brightness: number): string | null {
  if (brightness < MIN_BRIGHTNESS) return "is too dark. Retake it with the lights on or in daylight.";
  if (brightness > MAX_BRIGHTNESS) return "is overexposed. Retake it away from direct glare.";
  return null;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("unreadable"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sourceSize(source: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };
}

/** Returns why the photo is unusable (a sentence fragment that follows its name), or null if it's fine. */
export async function checkPhotoQuality(file: File): Promise<string | null> {
  if (!ACCEPTED_TYPES.includes(file.type)) return "must be a JPG, PNG or WebP image.";
  if (file.size > MAX_PHOTO_BYTES) return "is larger than 10 MB.";

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await loadBitmap(file);
  } catch {
    return "could not be read as an image.";
  }

  const { width, height } = sourceSize(source);
  const dimensionProblem = checkDimensions(width, height);
  if (dimensionProblem) return dimensionProblem;

  const scale = Math.min(1, ANALYSIS_LONG_SIDE / Math.max(width, height));
  const w = Math.max(3, Math.round(width * scale));
  const h = Math.max(3, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null; // Can't analyse here; the API still enforces resolution.
  ctx.drawImage(source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * data[i * 4]! + 0.587 * data[i * 4 + 1]! + 0.114 * data[i * 4 + 2]!;
  }

  const exposureProblem = checkExposure(averageBrightness(gray));
  if (exposureProblem) return exposureProblem;
  if (laplacianVariance(gray, w, h) < MIN_SHARPNESS) {
    return "looks blurry. Hold the phone steady and tap to focus, then retake it.";
  }
  return null;
}
