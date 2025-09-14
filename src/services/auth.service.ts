import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { EmailService } from './email.service';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    private emailService = new EmailService();
    private readonly VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || 'verification-secret-key';
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
        const user = this.userRepository.create({
          ...userData,
          isEmailVerified: false, // ADDED: Set email verification status
          emailVerificationToken: this.generateVerificationToken(userData.email) // ADDED: Generate verification token
        });

        await this.userRepository.save(user);

        // ADDED: Send verification email after user creation
        await this.sendVerificationEmail(user);
    
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private generateVerificationToken(email: string): string {
        return jwt.sign(
          { email, type: 'email-verification' },
          this.VERIFICATION_SECRET,
          { expiresIn: '24h' }
        );
    }

    private async sendVerificationEmail(user: User): Promise<void> {
        // Skip sending emails during automated tests (e.g., Cypress)
        if (process.env.NODE_ENV === 'test' || process.env.CYPRESS === 'true') {
            console.log('sendVerificationEmail skipped in test environment');
            return;
        }
        const verificationUrl = `http://localhost:4200/verify-email/${user.emailVerificationToken}`;
        
        const emailContent = {
            to: user.email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to Our App!</h2>
                    <p>Hi ${user.name},</p>
                    <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                          style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    
                    <p>This link will expire in 24 hours.</p>
                    
                    <p>If you didn't create an account, please ignore this email.</p>
                    
                    <p>Best regards,<br>Your App Team</p>
                </div>
            `,
            text: `
                Welcome to Our App!
                
                Hi ${user.name},
                
                Thank you for registering! Please verify your email address by visiting:
                ${verificationUrl}
                
                This link will expire in 24 hours.
                
                If you didn't create an account, please ignore this email.
                
                Best regards,
                Your App Team
            `
        };

        await this.emailService.sendEmail(emailContent);
    }

    async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
      try {
          const decoded = jwt.verify(token, this.VERIFICATION_SECRET) as { email: string; type: string };
          
          if (decoded.type !== 'email-verification') {
              throw new Error('Invalid token type');
          }

          const user = await this.userRepository.findOne({
              where: { email: decoded.email }
          });

          if (!user) {
              throw new Error('User not found');
          }

          if (user.isEmailVerified) {
              return { success: false, message: 'Email already verified' };
          }

          // ADDED: Update user verification status
          user.isEmailVerified = true;
          user.emailVerificationToken = null; // ADDED: Clear the verification token
          await this.userRepository.save(user);

          return { success: true, message: 'Email verified successfully' };
      } catch (error) {
          if (error.name === 'TokenExpiredError') {
              throw new Error('Verification link has expired');
          }
          throw new Error('Invalid verification token');
      }
  }

    async login(email: string, password: string) {
        // Find user by email
        const user = await this.userRepository.findOne({
          where: { email }
        });

        console.log('login:user', user)
    
        if (!user) {
          throw new Error('Invalid credentials');
        }
    
        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        console.log('login:isPasswordValid', isPasswordValid)
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

    async checkTokenValidity(token: string): Promise<{ isValid: boolean; expiresAt?: Date; timeRemaining?: number }> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; exp: number };
            const expiresAt = new Date(decoded.exp * 1000);
            const timeRemaining = expiresAt.getTime() - Date.now();
            
            return {
                isValid: true,
                expiresAt,
                timeRemaining: Math.max(0, timeRemaining)
            };
        } catch (error) {
            return { isValid: false };
        }
    }

    async resetTokenIfActive(token: string): Promise<{ newToken?: string; message: string }> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; exp: number };
            const expiresAt = new Date(decoded.exp * 1000);
            const timeRemaining = expiresAt.getTime() - Date.now();
            
            // Check if token expires within 1 hour (3600000 ms)
            const oneHour = 60 * 60 * 1000;
            
            if (timeRemaining <= oneHour && timeRemaining > 0) {
                // Generate new token
                const newToken = this.generateToken(decoded.userId);
                
                // Update last login to current time
                const user = await this.userRepository.findOne({
                    where: { id: decoded.userId }
                });
                
                if (user) {
                    user.lastLoginAt = new Date();
                    await this.userRepository.save(user);
                }
                
                return {
                    newToken,
                    message: 'Token refreshed successfully'
                };
            }
            
            return {
                message: 'Token is still valid, no refresh needed'
            };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

}