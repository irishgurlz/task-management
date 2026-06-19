export async function seedTask(prisma, project, user) {

  const task = await prisma.task.create({
    data: {
      title: "Buat API Login",
      description: "Membuat endpoint login JWT",
      status: "todo",
      priority: "high",
      project_id: project.id,
      assignee_id: user.id
    }
  });


  return task;
}