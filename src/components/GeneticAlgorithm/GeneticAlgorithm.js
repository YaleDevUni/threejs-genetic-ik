// src/components/GeneticAlgorithm/GeneticAlgorithm.js

import Individual from "./Individual.js";
import Population from "./Population.js";

class GeneticAlgorithm {
  constructor(targetPath, options = {}) {
    this.targetPath = targetPath; // Array of Vector3 points
    this.populationSize = options.populationSize || 50;
    this.mutationRate = options.mutationRate || 0.01;
    this.crossoverRate = options.crossoverRate || 0.7;
    this.maxGenerations = options.maxGenerations || 10;
    this.angleRange = options.angleRange || Math.PI; // Maximum rotation in radians

    this.population = new Population(this.populationSize, this.angleRange);
    this.currentGeneration = 0;
    this.bestSolution = null;
    this.isFinished = false;
  }
  
  evaluateIndividual(individual) {
    // This method should be overridden by subclasses
    throw new Error("evaluateIndividual method must be implemented.");
  }

  evaluateFitness() {
    this.population.individuals.forEach((individual) => {
      this.evaluateIndividual(individual);
    });
  }

  selectParents() {
    // Tournament selection
    const tournamentSize = 3;
    const parents = [];

    for (let i = 0; i < this.population.size; i++) {
      let best = null;
      for (let j = 0; j < tournamentSize; j++) {
        const ind = this.population.getRandomIndividual();
        if (!best || ind.fitness > best.fitness) {
          best = ind;
        }
      }
      parents.push(best);
    }

    return parents;
  }

  crossover(parent1, parent2) {
    if (Math.random() > this.crossoverRate) {
      return [parent1.clone(), parent2.clone()];
    }

    const crossoverPoint = Math.floor(
      Math.random() * parent1.chromosome.length
    );
    const child1Chromosome = [
      ...parent1.chromosome.slice(0, crossoverPoint),
      ...parent2.chromosome.slice(crossoverPoint),
    ];
    const child2Chromosome = [
      ...parent2.chromosome.slice(0, crossoverPoint),
      ...parent1.chromosome.slice(crossoverPoint),
    ];

    return [new Individual(child1Chromosome), new Individual(child2Chromosome)];
  }

  mutate(individual) {
    individual.chromosome = individual.chromosome.map((gene) => {
      if (Math.random() < this.mutationRate) {
        return gene + (Math.random() * 2 - 1) * 0.1; // Small mutation
      }
      return gene;
    });
  }

  createNewGeneration() {
    const parents = this.selectParents();
    const newIndividuals = [];

    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1];
      const [child1, child2] = this.crossover(parent1, parent2);
      this.mutate(child1);
      this.mutate(child2);
      newIndividuals.push(child1, child2);
    }

    this.population.individuals = newIndividuals.slice(0, this.populationSize);
    this.currentGeneration++;
  }

  getBestSolution() {
    let best = null;
    this.population.individuals.forEach((individual) => {
      if (!best || individual.fitness > best.fitness) {
        best = individual;
      }
    });
    this.bestSolution = best;
    return best;
  }

  runIteration() {
    this.evaluateFitness();
    const currentBest = this.getBestSolution();

    if (!this.bestSolution || currentBest.fitness > this.bestSolution.fitness) {
      this.bestSolution = currentBest;
    }

    if (this.bestSolution.fitness === 1) {
      this.isFinished = true;
      return true;
    }

    if (this.currentGeneration >= this.maxGenerations) {
      this.isFinished = true;
      return true;
    }

    this.createNewGeneration();
    return false;
  }

  run() {
    while (!this.isFinished) {
      this.runIteration();
    }
  }
}

export default GeneticAlgorithm;
