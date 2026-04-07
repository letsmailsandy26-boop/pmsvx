import { PrismaClient, Role, ProjectStatus, Priority, TaskStatus, TaskType, LogCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
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

  const manager = await prisma.user.upsert({
    where: { email: 'manager@pms.com' },
    update: {},
    create: {
      name: 'Jane Manager',
      email: 'manager@pms.com',
      passwordHash: managerPassword,
      role: Role.Manager,
      department: 'Engineering',
      designation: 'Project Manager',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'john@pms.com' },
    update: {},
    create: {
      name: 'John Developer',
      email: 'john@pms.com',
      passwordHash: userPassword,
      role: Role.User,
      department: 'Engineering',
      designation: 'Senior Developer',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@pms.com' },
    update: {},
    create: {
      name: 'Sarah Tester',
      email: 'sarah@pms.com',
      passwordHash: userPassword,
      role: Role.User,
      department: 'QA',
      designation: 'QA Engineer',
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'E-Commerce Platform',
      description: 'Building a full-featured e-commerce platform with React and Node.js',
      clientName: 'RetailCo Ltd',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: ProjectStatus.Active,
      priority: Priority.High,
      managerId: manager.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: admin.id },
      { projectId: project.id, userId: manager.id },
      { projectId: project.id, userId: user1.id },
      { projectId: project.id, userId: user2.id },
    ],
    skipDuplicates: true,
  });

  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: 'Setup project infrastructure',
      description: 'Configure CI/CD pipeline, Docker containers, and deployment scripts',
      type: TaskType.Task,
      status: TaskStatus.Closed,
      priority: Priority.Critical,
      assigneeId: user1.id,
      reporterId: manager.id,
      reviewerId: manager.id,
      progressPercent: 100,
      estimatedHours: 8,
      timeSpentHours: 6,
      dueDate: new Date('2024-01-15'),
      closedAt: new Date('2024-01-14'),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: 'Implement user authentication',
      description: 'JWT-based auth with refresh tokens, role-based access control',
      type: TaskType.Feature,
      status: TaskStatus.InProgress,
      priority: Priority.High,
      assigneeId: user1.id,
      reporterId: manager.id,
      reviewerId: manager.id,
      progressPercent: 60,
      estimatedHours: 16,
      timeSpentHours: 9.5,
      dueDate: new Date('2024-02-01'),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: 'Fix checkout page crash on mobile',
      description: 'The checkout page throws a TypeError on iOS Safari when applying coupon codes',
      type: TaskType.Bug,
      status: TaskStatus.Testing,
      priority: Priority.Critical,
      assigneeId: user2.id,
      reporterId: user1.id,
      reviewerId: manager.id,
      progressPercent: 80,
      estimatedHours: 4,
      timeSpentHours: 3,
      dueDate: new Date('2024-01-25'),
    },
  });

  await prisma.timeLog.createMany({
    data: [
      { taskId: task2.id, userId: user1.id, hours: 4, category: LogCategory.Development, description: 'Implemented JWT token generation and validation', logDate: new Date('2024-01-20') },
      { taskId: task2.id, userId: user1.id, hours: 5.5, category: LogCategory.Development, description: 'Added refresh token logic and middleware', logDate: new Date('2024-01-22') },
      { taskId: task3.id, userId: user2.id, hours: 3, category: LogCategory.Testing, description: 'Reproduced and diagnosed the iOS Safari issue', logDate: new Date('2024-01-21') },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { taskId: task2.id, authorId: manager.id, body: 'Please make sure to include rate limiting on the login endpoint.' },
      { taskId: task2.id, authorId: user1.id, body: 'Already planned - using express-rate-limit with Redis store.' },
      { taskId: task3.id, authorId: user1.id, body: 'The issue is in the coupon validation function. It calls `.trim()` on a potentially undefined value.' },
    ],
  });

  console.log('Seeding complete!');
  console.log('Credentials:');
  console.log('  Admin:   admin@pms.com / admin123');
  console.log('  Manager: manager@pms.com / manager123');
  console.log('  User:    john@pms.com / user123');
  console.log('  User:    sarah@pms.com / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
