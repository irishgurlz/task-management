export async function seedProject(prisma, admin) {

  const project = await prisma.project.create({
    data: {
      name: "Task Management App",
      description: "Project untuk mengelola task",
      created_by: admin.id
    }
  });


  return project;
}