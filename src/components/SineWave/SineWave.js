// src/components/SineWave/SineWave.js
import {
  Line,
  BufferGeometry,
  LineBasicMaterial,
  Float32BufferAttribute,
  Vector3,
} from "three";

export class SineWave {
  constructor(amplitude, frequency, points) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.points = points;
    this.line = this.createLine();
  }

  createLine() {
    const geometry = new BufferGeometry();
    const vertices = [];

    for (let i = 0; i < this.points; i++) {
      const x = (i / this.points) * 10; // Adjust as needed
      const y = this.amplitude * Math.sin(this.frequency * x);
      const z = 0;
      vertices.push(x, y, z);
    }

    // Correctly import and use Float32BufferAttribute
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    const material = new LineBasicMaterial({ color: 0xff0000 });
    const line = new Line(geometry, material);
    return line;
  }

  getCartesianPath() {
    const path = [];
    const positions = this.line.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      path.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }
    return path;
  }
}
