export async function seedAuditLog(prisma, admin, task) {

  const auditLog = await prisma.auditLog.create({
    data: {
      action: "MANUAL_CREATE_TASK",
      requestPayload: {
        prompt: "ini prompt user"
      },
      status: "SUCCESS",
      user: {
        connect: {
          id: admin.id
        }
      }
    }
  });


  return auditLog;
}