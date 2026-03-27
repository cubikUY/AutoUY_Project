import { prisma } from "@autouuy/database";

interface AuditLogOptions {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT" | "LOGIN" | "STATUS_CHANGE";
  entity: "VEHICLE" | "LEAD" | "BRAND" | "USER" | "DEALER";
  entityId: string;
  details?: string;
  oldValue?: any;
  newValue?: any;
}

export async function logAction(options: AuditLogOptions) {
  try {
    // Deep clone to avoid proxy issues with JSON
    const cleanOldValue = options.oldValue ? JSON.parse(JSON.stringify(options.oldValue)) : null;
    const cleanNewValue = options.newValue ? JSON.parse(JSON.stringify(options.newValue)) : null;

    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        details: options.details,
        oldValue: cleanOldValue,
        newValue: cleanNewValue,
      },
    });
  } catch (error) {
    console.error("[AuditLog Error]", error);
  }
}
