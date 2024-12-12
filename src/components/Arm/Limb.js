// src/components/Arm/Limb.js
import { BoxGeometry, MeshStandardMaterial, Mesh } from "three";

function createLimb(length) {
  const geometry = new BoxGeometry(0.1, length, 0.1); // thin rectangular bar
  const material = new MeshStandardMaterial({ color: 0x888888 });
  const limb = new Mesh(geometry, material);
  limb.castShadow = true;
  limb.receiveShadow = true;
  return limb;
}

export default createLimb;
