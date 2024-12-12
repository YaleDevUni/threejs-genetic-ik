// src/components/Scene/Lights.js
import { HemisphereLight, DirectionalLight } from "three";

function createLights(scene) {
  // Hemisphere light provides a nice ambient gradient lighting.
  const hemisphereLight = new HemisphereLight(0xffffff, 0x444444, 0.6);
  hemisphereLight.position.set(0, 50, 0);
  scene.add(hemisphereLight);

  // Directional light simulating sunlight.
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}

export default createLights;
