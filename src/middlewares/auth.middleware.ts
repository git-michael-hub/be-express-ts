import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
    user?: any;
  }
  
  export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }
  
    try {
      const user = await authService.verifyToken(token);
      req.user = user;
      next(); // Call next to continue to the route handler
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
  };