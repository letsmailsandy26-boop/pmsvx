import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    res.status(409).json({ success: false, message: 'A record with this value already exists.' });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Record not found.' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, message });
};
