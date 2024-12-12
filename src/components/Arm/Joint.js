// src/components/Arm/Joint.js
import { Object3D, SphereGeometry, MeshStandardMaterial, Mesh } from "three";

function createJoint() {
  const joint = new Object3D();

  const geometry = new SphereGeometry(0.05, 16, 16);
  const material = new MeshStandardMaterial({ color: 0x555555 });
  const sphere = new Mesh(geometry, material);
  joint.add(sphere);


  return joint;
}

export default createJoint;
