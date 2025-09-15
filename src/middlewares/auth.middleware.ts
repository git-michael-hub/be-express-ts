import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
    user?: any;
    newToken?: string;
  }
  
  export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // If no token in header, try to get from cookies
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
  
    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }
  
    try {
      // First check if token is valid
      const tokenValidity = await authService.checkTokenValidity(token);
      
      if (!tokenValidity.isValid) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }

      // If token is valid but expires within 1 hour, try to refresh it
      const oneHour = 60 * 60 * 1000;
      if (tokenValidity.timeRemaining && tokenValidity.timeRemaining <= oneHour) {
        try {
          const resetResult = await authService.resetTokenIfActive(token);
          if (resetResult.newToken) {
            // Set the new token in response header for client to update
            res.setHeader('X-New-Token', resetResult.newToken);
            // Also set as cookie for Swagger UI
            res.setHeader('Set-Cookie', `authToken=${resetResult.newToken}; Path=/; HttpOnly; Secure; SameSite=Strict`);
            req.newToken = resetResult.newToken;
          }
        } catch (refreshError) {
          // If refresh fails, continue with original token
          console.log('Token refresh failed:', refreshError.message);
        }
      }

      // Get user from token
      const user = await authService.verifyToken(token);
      req.user = user;
      next(); // Call next to continue to the route handler
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
  };