import * as THREE from "three";
import { hashString, seededRandom } from "~/src/utils";
import { CHUNK_SIZE } from "./constants";
import type { PlaneData } from "./types";

const MAX_PLANE_CACHE = 256;
const planeCache = new Map<string, PlaneData[]>();

const touchPlaneCache = (key: string) => {
  const v = planeCache.get(key);
  if (!v) return;
  planeCache.delete(key);
  planeCache.set(key, v);
};

const evictPlaneCache = () => {
  while (planeCache.size > MAX_PLANE_CACHE) {
    const firstKey = planeCache.keys().next().value as string | undefined;
    if (!firstKey) break;
    planeCache.delete(firstKey);
  }
};

export const getChunkUpdateThrottleMs = (isZooming: boolean, zoomSpeed: number): number => {
  if (zoomSpeed > 1.0) return 500;
  if (isZooming) return 400;
  return 100;
};

export const getMediaDimensions = (media: HTMLImageElement | undefined) => {
  const width = media instanceof HTMLImageElement ? media.naturalWidth || media.width : undefined;
  const height = media instanceof HTMLImageElement ? media.naturalHeight || media.height : undefined;
  return { width, height };
};

const TOTAL_MEDIA = 20;

export const generateChunkPlanes = (cx: number, cy: number, cz: number): PlaneData[] => {
  const planes: PlaneData[] = [];
  const seed = hashString(`${cx},${cy},${cz}`);

  for (let i = 0; i < 2; i++) {
    const s = seed + i * 9973;
    const r = (n: number) => seededRandom(s + n * 7919);
    const size = 22 + r(4) * 10;

    // spread index evenly across all media using chunk coords
    // multiply by large primes to avoid patterns
    const rawIdx = Math.abs((cx * 1031 + cy * 2053 + cz * 4099 + i * 8191));
    // ensure items 0 and 1 in same chunk are always different
    const mediaIdx = (rawIdx + i * Math.ceil(TOTAL_MEDIA / 2)) % TOTAL_MEDIA;

    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + r(0) * CHUNK_SIZE * 0.85,
        cy * CHUNK_SIZE + r(1) * CHUNK_SIZE * 0.85,
        cz * CHUNK_SIZE + r(2) * CHUNK_SIZE * 0.85
      ),
      scale: new THREE.Vector3(size, size, 1),
      mediaIndex: mediaIdx,
    });
  }

  return planes;
};

export const generateChunkPlanesCached = (cx: number, cy: number, cz: number): PlaneData[] => {
  const key = `${cx},${cy},${cz}`;
  const cached = planeCache.get(key);
  if (cached) {
    touchPlaneCache(key);
    return cached;
  }
  const planes = generateChunkPlanes(cx, cy, cz);
  planeCache.set(key, planes);
  evictPlaneCache();
  return planes;
};

export const shouldThrottleUpdate = (lastUpdateTime: number, throttleMs: number, currentTime: number): boolean => {
  return currentTime - lastUpdateTime >= throttleMs;
};