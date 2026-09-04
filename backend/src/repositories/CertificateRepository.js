import { BaseRepository } from './BaseRepository.js';
import { Certificate } from '../models/index.js';

export class CertificateRepository extends BaseRepository {
  constructor() {
    super(Certificate);
  }

  async findBySlug(slug) {
    return this.findOne({ slug: slug.toLowerCase() });
  }
}

export default new CertificateRepository();
