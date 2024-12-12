// src/components/GeneticAlgorithm/Population.js

import Individual from "./Individual.js";

class Population {
  constructor(size, angleRange) {
    this.size = size;
    this.angleRange = angleRange;
    this.individuals = [];

    for (let i = 0; i < size; i++) {
      const chromosome = this.generateChromosome();
      this.individuals.push(new Individual(chromosome));
    }
  }

  generateChromosome() {
    // Assuming 3 joints with 3 angles each (x, y, z)
    const numGenes = 9;
    const chromosome = [];
    for (let i = 0; i < numGenes; i++) {
      // Initialize angles randomly within the specified range
      const angle = (Math.random() * 2 - 1) * this.angleRange;
      chromosome.push(angle);
    }
    return chromosome;
  }

  getRandomIndividual() {
    const index = Math.floor(Math.random() * this.individuals.length);
    return this.individuals[index];
  }

  initializeNear(bestChromosome, variance = 0.1) {
    this.individuals.forEach((individual) => {
      individual.chromosome = individual.chromosome.map((gene, index) => {
        return bestChromosome[index] + (Math.random() * 2 - 1) * variance;
      });
    });
  }
}

export default Population;
