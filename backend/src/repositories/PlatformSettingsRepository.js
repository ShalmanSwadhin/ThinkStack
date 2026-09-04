import { BaseRepository } from './BaseRepository.js';
import { PlatformSettings } from '../models/index.js';

export class PlatformSettingsRepository extends BaseRepository {
  constructor() {
    super(PlatformSettings);
  }

  async getGlobal() {
    let settings = await this.findOne({ key: 'global' });
    if (!settings) {
      settings = await this.create({ key: 'global' });
    }
    return settings;
  }
}

export default new PlatformSettingsRepository();
