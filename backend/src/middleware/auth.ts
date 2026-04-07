import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    sendError(res, 'Access token required', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: insufficient permissions', 403);
      return;
    }
    next();
  };
};
