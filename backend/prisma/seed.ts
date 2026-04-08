import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up demo project if it exists (cascades to tasks, comments, timelogs, members)
  const demoProject = await prisma.project.findFirst({ where: { name: 'E-Commerce Platform' } });
  if (demoProject) {
    await prisma.project.delete({ where: { id: demoProject.id } });
    console.log('Removed demo project.');
  }

  // Deactivate demo users
  await prisma.user.updateMany({
    where: { email: { in: ['manager@pms.com', 'john@pms.com', 'sarah@pms.com'] } },
    data: { isActive: false },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@pms.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@pms.com',
      passwordHash: adminPassword,
      role: Role.Admin,
      department: 'Management',
      designation: 'System Administrator',
    },
  });

  console.log('Seeding complete!');
  console.log('Credentials:');
  console.log('  Admin: admin@pms.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
