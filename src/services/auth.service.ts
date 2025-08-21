import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    // @TODO
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    private readonly JWT_EXPIRES_IN = '24h';

    async register(userData: { name: string; email: string; password: string }) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
          where: { email: userData.email }
        });
    
        if (existingUser) {
          throw new Error('User already exists with this email');
        }
    
        // Create new user
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
    
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(email: string, password: string) {
        // Find user by email
        const user = await this.userRepository.findOne({
          where: { email }
        });
    
        if (!user) {
          throw new Error('Invalid credentials');
        }
    
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }
    
        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
    
        // Generate JWT token
        const token = this.generateToken(user.id);
    
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return {
          user: userWithoutPassword,
          token
        };
    }

    private generateToken(userId: string): string {
        return jwt.sign(
          { userId },
          this.JWT_SECRET,
          { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    async verifyToken(token: string) {
        try {
          const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
          const user = await this.userRepository.findOne({
            where: { id: decoded.userId }
          });
          return user;
        } catch (error) {
          throw new Error('Invalid token');
        }
    }

}