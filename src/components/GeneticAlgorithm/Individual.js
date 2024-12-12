// src/components/GeneticAlgorithm/Individual.js

class Individual {
  constructor(chromosome) {
    this.chromosome = chromosome;
    this.fitness = 0;
  }

  clone() {
    const newChrom = [...this.chromosome];
    const ind = new Individual(newChrom);
    ind.fitness = this.fitness;
    return ind;
  }
}

export default Individual;
