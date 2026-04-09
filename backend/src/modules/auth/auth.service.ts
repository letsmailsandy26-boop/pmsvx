import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Your account has been disabled. Please contact an administrator.'), { statusCode: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async me(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, designation: true, phone: true,
        avatarUrl: true, isActive: true, createdAt: true,
      },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  },
};
