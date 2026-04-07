import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import projectsRoutes from './modules/projects/projects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import commentsRoutes from './modules/comments/comments.routes';
import timelogsRoutes from './modules/timelogs/timelogs.routes';
import { taskRouter as taskAttachRoutes, projectRouter as projectAttachRoutes, attachmentsMainRouter } from './modules/attachments/attachments.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import reportsRoutes from './modules/reports/reports.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import { listAllTimeLogs } from './modules/timelogs/timelogs.controller';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/attachments', projectAttachRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/tasks/:taskId/comments', commentsRoutes);
app.use('/api/tasks/:taskId/timelogs', timelogsRoutes);
app.use('/api/tasks/:taskId/attachments', taskAttachRoutes);
app.use('/api/attachments', attachmentsMainRouter);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/timelogs', (req, res, next) => {
  if (req.method === 'GET') return listAllTimeLogs(req as any, res, next);
  next();
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
