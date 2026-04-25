import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const videoCache = new Map<string, HTMLVideoElement>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

const isVideo = (url: string) => url.endsWith(".mp4") || url.endsWith(".webm");

const isTextureLoaded = (tex: THREE.Texture): boolean => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

// tick all video textures every frame so they update
const videoTextures = new Set<THREE.VideoTexture>();
export const tickVideoTextures = () => {
  for (const vt of videoTextures) {
    if (vt.image instanceof HTMLVideoElement && !vt.image.paused) {
      vt.needsUpdate = true;
    }
  }
};

export const getTexture = (item: MediaItem, onLoad?: (texture: THREE.Texture) => void): THREE.Texture => {
  const key = item.url;
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isVideo(key) || isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  if (isVideo(key)) {
    // create video element
    const video = document.createElement("video");
    video.src = key;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    videoCache.set(key, video);

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    videoTextures.add(texture);
    textureCache.set(key, texture);

    video.play().then(() => {
      onLoad?.(texture);
    }).catch(() => {
      // autoplay blocked — still return texture
      onLoad?.(texture);
    });

    return texture;
  }

  // image path
  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  const texture = loader.load(
    key,
    (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      loadCallbacks.get(key)?.forEach((cb) => {
        try { cb(tex); } catch (err) { console.error(err); }
      });
      loadCallbacks.delete(key);
    },
    undefined,
    (err) => console.error("Texture load failed:", key, err)
  );

  textureCache.set(key, texture);
  return texture;
};