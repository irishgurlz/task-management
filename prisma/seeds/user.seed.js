import bcrypt from "bcrypt";

export async function seedUser(prisma) {
  const password = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password,
      role: "admin"
    }
  });

  const user = await prisma.user.create({
    data: {
      name: "User Test",
      email: "user@gmail.com",
      password,
      role: "user"
    }
  });

  return {
    admin,
    user
  };
}