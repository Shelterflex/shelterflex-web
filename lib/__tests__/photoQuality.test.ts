import { describe, it, expect } from "vitest";
import {
  checkDimensions,
  checkExposure,
  laplacianVariance,
  averageBrightness,
} from "../photoQuality";

describe("photo quality checks", () => {
  it("accepts large photos in either orientation and rejects small ones", () => {
    expect(checkDimensions(4032, 3024)).toBeNull();
    expect(checkDimensions(3024, 4032)).toBeNull();
    expect(checkDimensions(1200, 900)).toBeNull();
    expect(checkDimensions(640, 480)).toMatch(/too small \(640×480\)/);
    expect(checkDimensions(4000, 600)).toMatch(/too small/);
  });

  it("tells sharp images from blurry ones", () => {
    const w = 64;
    const h = 64;
    const sharp = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) sharp[y * w + x] = (x + y) % 2 === 0 ? 255 : 0;
    }
    const flat = new Uint8ClampedArray(w * h).fill(128);
    const gradient = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) gradient[y * w + x] = x * 4;

    expect(laplacianVariance(sharp, w, h)).toBeGreaterThan(1000);
    expect(laplacianVariance(flat, w, h)).toBe(0);
    expect(laplacianVariance(gradient, w, h)).toBeLessThan(1);
  });

  it("flags photos that are too dark or too bright", () => {
    expect(checkExposure(averageBrightness([10, 20, 30]))).toMatch(/too dark/);
    expect(checkExposure(averageBrightness([250, 255, 245]))).toMatch(/overexposed/);
    expect(checkExposure(averageBrightness([120, 140, 130]))).toBeNull();
  });
});
