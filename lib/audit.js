import { prisma } from "./db";

export async function writeAuditLog({ actorId = null, event, level = "info", metadata }) {
  await prisma.auditLog.create({
    data: {
      actorId,
      event,
      level,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
