import { PrismaClient } from "@prisma/client";

import { seedUser } from "./seeds/user.seed.js";
import { seedProject } from "./seeds/project.seed.js";
import { seedTask } from "./seeds/task.seed.js";
import { seedAuditLog } from "./seeds/auditLog.seed.js";


const prisma = new PrismaClient();


async function main() {

  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();


  const {admin, user} = await seedUser(prisma);

  const project = await seedProject(
    prisma,
    admin
  );

  const task = await seedTask(
    prisma,
    project,
    user
  );

  await seedAuditLog(
    prisma,
    admin,
    task
  );


  console.log("Seed berhasil dijalankan");
}


main()
.catch(console.error)
.finally(async () => {
  await prisma.$disconnect();
});