import { BaseRepository } from './BaseRepository.js';
import { Visualizer } from '../models/index.js';

export class VisualizerRepository extends BaseRepository {
  constructor() {
    super(Visualizer);
  }

  async findByAlgorithmId(algorithmId) {
    return this.findOne({ algorithmId: algorithmId.toLowerCase() });
  }

  async findAllPublished(options = {}) {
    return this.find(
      { status: 'published', visibility: { $ne: 'private' } },
      { sort: { order: 1, name: 1 }, ...options }
    );
  }
}

export default new VisualizerRepository();
