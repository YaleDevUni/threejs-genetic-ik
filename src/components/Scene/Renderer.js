// src/components/Scene/Renderer.js
import { WebGLRenderer } from "three";

function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; // Enable shadow maps if needed
  renderer.shadowMap.type = 2; // Example: THREE.PCFSoftShadowMap

  return renderer;
}

export default createRenderer;
