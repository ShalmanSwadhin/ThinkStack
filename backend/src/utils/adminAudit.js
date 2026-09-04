import auditLogRepository from '../repositories/AuditLogRepository.js';

export const logAdminAction = async (req, action, entityType, entityId = null, metadata = {}) => {
  if (!req?.user?.id) return null;

  return auditLogRepository.logAction({
    adminId: req.user.id,
    action,
    entityType,
    entityId,
    metadata,
    ipAddress: req.ip,
  });
};

export default logAdminAction;
