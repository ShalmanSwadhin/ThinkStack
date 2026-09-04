import { BaseRepository } from './BaseRepository.js';
import { AuditLog } from '../models/index.js';

export class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async logAction({ adminId, action, entityType, entityId = null, metadata = {}, ipAddress = null }) {
    return this.create({
      adminId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
    });
  }
}

export default new AuditLogRepository();
