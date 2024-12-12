import { PerspectiveCamera } from "three";

function createCamera() {
  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;

  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 2, 5); // Adjust camera position as desired
  return camera;
}

export default createCamera;
