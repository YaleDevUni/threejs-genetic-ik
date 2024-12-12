// src/main.js

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import createLights from "./components/Scene/Lights.js";
import Arm from "./components/Arm/Arm.js";
import { SineWave } from "./components/SineWave/SineWave.js";
import GeneticAlgorithm from "./components/GeneticAlgorithm/GeneticAlgorithm.js";
import * as TWEEN from "@tweenjs/tween.js"; // Correct import
import Population from "./components/GeneticAlgorithm/Population.js";

// Declare variables
let scene, camera, renderer, controls;
let arm;
let path;
let ga;
let generationsRun = 0;

// Segment-related variables
let segmentSize = 1; // Now processing one point at a time
let currentSegment = 0;
let numSegments = 0;
let prevBestAngles = null; // Store best angles from previous segment

// Data structure to store optimized angles for animation
let optimizedAngles = [];

// DOM elements
const statusEl = document.getElementById("status");
const populationSizeEl = document.getElementById("populationSize");
const mutationRateEl = document.getElementById("mutationRate");
const crossoverRateEl = document.getElementById("crossoverRate");
const maxGenerationsEl = document.getElementById("maxGenerations");
const gaPointsEl = document.getElementById("gaPoints");
const initGAButton = document.getElementById("initGAButton");
const runSegmentButton = document.getElementById("runSegmentButton");
const animateArmButton = document.getElementById("animateArmButton");

// Control Panel Elements for Arm Position
const armPosXEl = document.getElementById("armPosX");
const armPosYEl = document.getElementById("armPosY");
const armPosZEl = document.getElementById("armPosZ");

// Control Panel Elements for Sine Wave
const sineAmplitudeEl = document.getElementById("sineAmplitude");
const sineFrequencyEl = document.getElementById("sineFrequency");
const sinePointsEl = document.getElementById("sinePoints");

// Control Panel Elements for Sine Wave Positioning
const sineStartXEl = document.getElementById("sineStartX");
const sineSpacingEl = document.getElementById("sineSpacing");

// Progress Bar Element
const progressBar = document.getElementById("progressBar");
// Initialize Arm
arm = new Arm();
// Initialize the application
init();

function init() {
  // Set up scene
  scene = new Scene();

  // Set up camera
  camera = new PerspectiveCamera(
    75,
    (window.innerWidth - 300) / window.innerHeight, // Adjusted for control panel width
    0.1,
    1000
  );
  camera.position.set(5, 5, 10); // Adjusted for better initial view

  // Set up renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth - 300, window.innerHeight); // Adjusted for control panel width
  document.getElementById("container").appendChild(renderer.domElement);

  // Set up orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.update();

  // Add lights to the scene
  createLights(scene);

  scene.add(arm.getObject3D());

  // Initialize Sine Wave with default parameters and positioning
  updateSineWave(); // Calls the updateSineWave function to set initial sine wave

  // Calculate number of segments
  numSegments = path.length; // Since segmentSize is 1, each point is a segment

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
  onWindowResize();

  // Start the rendering loop
  animate();

  // Event listeners for Control Panel
  setupControlPanel();

  // Disable animation button initially
  animateArmButton.disabled = true;

  // Initial status update
  updateStatus("Initialization complete. Adjust parameters and initialize GA.");
  updateArmPosition();
}

/**
 * Custom Genetic Algorithm class extending the base GeneticAlgorithm.
 * Overrides the evaluateIndividual method to include deviation penalty.
 */
class CustomGeneticAlgorithm extends GeneticAlgorithm {
  constructor(arm, targetPoint, options = {}) {
    super([arm], options);
    this.arm = arm;
    this.targetPoint = targetPoint;
  }
  evaluateIndividual(individual) {
    console.log(this.maxGenerations);
    const angles = individual.chromosome;
    const N_k = 1;
    // console.log(`HHHHHHH${JSON.stringify(this.targetPath, null, 2)}`);
    let cumulativeError = 0;

    for (let i = 0; i < N_k; i++) {
      const jointAngles = [
        angles[i * 9],
        angles[i * 9 + 1],
        angles[i * 9 + 2], // Joint 0: x, y, z
        angles[i * 9 + 3],
        angles[i * 9 + 4],
        angles[i * 9 + 5], // Joint 1: x, y, z
        angles[i * 9 + 6],
        angles[i * 9 + 7],
        angles[i * 9 + 8], // Joint 2: x, y, z
      ];

      const reshapedAngles = [];
      for (let j = 0; j < jointAngles.length; j += 3) {
        reshapedAngles.push([
          jointAngles[j],
          jointAngles[j + 1],
          jointAngles[j + 2],
        ]);
      }

      arm.setJointAngles(reshapedAngles);
      arm.getObject3D().updateMatrixWorld(true);
      const endPos = arm.getEndEffectorPosition();
      const targetPos = this.targetPoint;
      const dx = endPos.x - targetPos.x;
      const dy = endPos.y - targetPos.y;
      const dz = endPos.z - targetPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      cumulativeError += dist;

      // Log the positions and distance
      console.log(`\n--- Evaluating Individual ---`);
      console.log(
        `Target Point ${i + 1}: (${targetPos.x}, ${targetPos.y}, ${
          targetPos.z
        })`
      );
      console.log(`End Effector: (${endPos.x}, ${endPos.y}, ${endPos.z})`);
      console.log(`Distance: ${dist.toFixed(4)}`);
    }

    // Deviation penalty based on previous best angles
    let deviationPenalty = 0;
    if (this.prevBestAngles && this.prevBestAngles.length === angles.length) {
      for (let i = 0; i < angles.length; i++) {
        deviationPenalty += Math.abs(angles[i] - this.prevBestAngles[i]) * 0.05;
      }
    }

    const totalError = cumulativeError + deviationPenalty;
    individual.fitness = 1 / (1 + totalError);
    // Log total error and fitness
    console.log(`Total Error: ${totalError}, Fitness: ${individual.fitness}`);
  }
}

function onWindowResize() {
  camera.aspect = (window.innerWidth - 300) / window.innerHeight; 
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth - 300, window.innerHeight);
  render();
}

function render() {
}

// Initialize GA Button Event Listener
initGAButton.addEventListener("click", () => {
  currentSegment = 0;
  prevBestAngles = null;
  optimizedAngles = [];
  progressBar.style.width = "0%";
  updateStatus("GA initialized. Click 'Run Segment GA' to start optimization.");
  runSegmentButton.disabled = false;
  animateArmButton.disabled = true;
});

// Function to Run GA Asynchronously
async function runGAAsync(gaInstance) {
  return new Promise((resolve) => {
    function iterate() {
      const done = gaInstance.runIteration();
      generationsRun++;

      const progress = (generationsRun / gaInstance.maxGenerations) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;

      if (done || generationsRun >= gaInstance.maxGenerations) {
        resolve();
      } else {
        setTimeout(iterate, 0);
      }
    }
    iterate();
  });
}

runSegmentButton.addEventListener("click", async () => {
  const gaPoints = parseInt(gaPointsEl.value, 10) || 10;

  if (gaPoints < 1 || gaPoints > path.length) {
    updateStatus(
      `Error: Please enter a valid number of points (1 to ${path.length}).`
    );
    return;
  }

  runSegmentButton.disabled = true;
  initGAButton.disabled = true; 

  for (let i = 0; i < gaPoints; i++) {
    if (currentSegment >= numSegments) {
      updateStatus("All segments processed.");
      break;
    }

    const targetPoint = path[currentSegment];
    updateTargetMarker(targetPoint);

    ga = new CustomGeneticAlgorithm(arm, targetPoint, {
      populationSize: parseInt(populationSizeEl.value, 10),
      mutationRate: parseFloat(mutationRateEl.value),
      crossoverRate: parseFloat(crossoverRateEl.value),
      maxGenerations: parseInt(maxGenerationsEl.value, 10),
      angleRange: Math.PI,
    });

    if (prevBestAngles) {
      if (ga.population.initializeNear) {
        ga.population.initializeNear(prevBestAngles, 0.1); 
      } else {
        console.warn(
          "initializeNear method is not implemented in the Population class."
        );
      }
    }

    generationsRun = 0;

    await runGAAsync(ga);

    const best = ga.getBestSolution();
    updateStatus(
      `Point ${currentSegment + 1}/${numSegments} optimized.\n` +
        `Generations: ${generationsRun}\nBest Fitness: ${best.fitness.toFixed(
          4
        )}`
    );

    optimizedAngles.push(best.chromosome);

    applyOptimizedAngles(best.chromosome);

    prevBestAngles = best.chromosome;

    currentSegment++;
  }

  if (currentSegment >= numSegments) {
    updateStatus(
      "All segments processed.\nYou can now animate the arm's movement."
    );
    animateArmButton.disabled = false;
    runSegmentButton.disabled = true;
  } else {
    updateStatus(
      `${gaPoints} points processed.\nClick 'Run Segment GA' to continue.`
    );
    runSegmentButton.disabled = false;
  }

  initGAButton.disabled = false; 
});

function updateStatus(msg) {
  statusEl.textContent = msg;
  console.log(msg);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateEndEffectorMarker(); 
}

function setupControlPanel() {
  armPosXEl.addEventListener("input", updateArmPosition);
  armPosYEl.addEventListener("input", updateArmPosition);
  armPosZEl.addEventListener("input", updateArmPosition);

  sineAmplitudeEl.addEventListener("input", updateSineWave);
  sineFrequencyEl.addEventListener("input", updateSineWave);
  sinePointsEl.addEventListener("input", updateSineWave);

  sineStartXEl.addEventListener("input", updateSineWavePositioning);
  sineSpacingEl.addEventListener("input", updateSineWavePositioning);

  gaPointsEl.addEventListener("input", validateGAPoints);
}

function validateGAPoints() {
  const gaPoints = parseInt(gaPointsEl.value, 10);
  if (isNaN(gaPoints) || gaPoints < 1 || gaPoints > path.length) {
    gaPointsEl.style.borderColor = "red";
    updateStatus(
      `Error: Please enter a valid number of points (1 to ${path.length}).`
    );
  } else {
    gaPointsEl.style.borderColor = "";
    updateStatus(`Number of GA points set to ${gaPoints}.`);
  }
}

function updateArmPosition() {
  const x = parseFloat(armPosXEl.value) || 0;
  const y = parseFloat(armPosYEl.value) || 0;
  const z = parseFloat(armPosZEl.value) || 0;

  arm.getObject3D().position.set(x, y, z);
}

function updateSineWave() {
  const existingSineWave = scene.getObjectByName("sineWave");
  if (existingSineWave) {
    scene.remove(existingSineWave);
  }

  const amplitude = parseFloat(sineAmplitudeEl.value) || 0.5;
  const frequency = parseFloat(sineFrequencyEl.value) || 1;
  const points = parseInt(sinePointsEl.value) || 50;

  const sineWave = new SineWave(amplitude, frequency, points);
  const wavePoints = sineWave.getCartesianPath();

  const startX = parseFloat(sineStartXEl.value) || -5;
  const spacing = parseFloat(sineSpacingEl.value) || 3;
  const translationX = startX + spacing;

  path = wavePoints.map((p) => new Vector3(p.x + translationX, p.y, p.z));

  sineWave.line.position.x = translationX; // Move the entire line forward
  sineWave.line.name = "sineWave"; // Assign a name for easy removal
  scene.add(sineWave.line);

  numSegments = path.length; 

  updateStatus(
    "Sine wave updated.\nTotal Segments: " +
      numSegments +
      "\nInitialize GA to proceed."
  );
}

function updateSineWavePositioning() {
  updateSineWave();
}


function applyOptimizedAngles(chromosome) {
  const reshapedAngles = [];
  for (let j = 0; j < chromosome.length; j += 3) {
    reshapedAngles.push([chromosome[j], chromosome[j + 1], chromosome[j + 2]]);
  }

  // Apply the joint angles to the arm
  arm.setJointAngles(reshapedAngles);
  arm.getObject3D().updateMatrixWorld(true);
}


function updateTargetMarker(targetPoint) {
  let marker = scene.getObjectByName("targetMarker");

  if (!marker) {
    const geometry = new SphereGeometry(0.1, 16, 16);
    const material = new MeshStandardMaterial({ color: 0xff00ff });
    marker = new Mesh(geometry, material);
    marker.name = "targetMarker";
    scene.add(marker);
  }

  marker.position.copy(targetPoint);
}


function updateEndEffectorMarker() {
  const endPos = arm.getEndEffectorPosition();
  let marker = scene.getObjectByName("endEffectorMarker");

  if (!marker) {
    // Create a new marker
    const geometry = new SphereGeometry(0.1, 16, 16);
    const material = new MeshStandardMaterial({ color: 0x0000ff });
    marker = new Mesh(geometry, material);
    marker.name = "endEffectorMarker";
    scene.add(marker);
  }

  // Update marker position
  marker.position.copy(endPos);
}

// Implement the Animation Button to Visualize the Arm's Movement
animateArmButton.addEventListener("click", () => {
  if (optimizedAngles.length === 0) {
    updateStatus("No optimized angles to animate. Please run the GA first.");
    return;
  }

  animateArmButton.disabled = true; 
  runSegmentButton.disabled = true; 
  initGAButton.disabled = true; 

  let currentAnimationPoint = 0;

  function animateStep() {
    if (currentAnimationPoint >= optimizedAngles.length) {
      updateStatus("Animation completed.");
      animateArmButton.disabled = false;
      runSegmentButton.disabled = false;
      initGAButton.disabled = false;
      return;
    }

    const angles = optimizedAngles[currentAnimationPoint];
    const reshapedAngles = [];
    for (let j = 0; j < angles.length; j += 3) {
      reshapedAngles.push([angles[j], angles[j + 1], angles[j + 2]]);
    }

    const currentAngles = arm.joints
      .map((joint) => [joint.rotation.x, joint.rotation.y, joint.rotation.z])
      .flat();

    const targetAngles = reshapedAngles.flat();


  }

  animateStep();
  updateStatus("Animation started.");
});
