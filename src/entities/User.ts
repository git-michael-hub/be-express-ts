/**
 * NOTE: any changes here should run migration
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from 'bcryptjs';

@Entity({ name: 'users' }) // Specifies the table name
export class User {
  @PrimaryGeneratedColumn('uuid') // Automatically generate a unique ID
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 }) // Increased length for hashed passwords
  password: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @Column({ type: "enum", enum: ["admin", "user"], default: "user" })
  role: "admin" | "user";

  @Column({ type: "varchar", array: true, length: 100, nullable: true })
  position: string[];

  @Column({ type: "varchar", array: true, length: 100, nullable: true })
  team: string[];

  @CreateDateColumn() // Automatically stores the creation date
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates when a record is updated
  updatedAt: Date;


  /**
   * Password
   */

  // Hash password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if it's not already a bcrypt hash
    if (this.password && !/^\$2[aby]\$\d{2}\$/.test(this.password)) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}


/**
 * For test purposes
 */
@Entity({ name: 'user_tests' }) // Specifies the table name
export class UserTest {
  @PrimaryGeneratedColumn('uuid') // Automatically generate a unique ID
  id: string;

  @Column({ type: "varchar", length: 100 })
  testName: string;

  @Column({ type: "varchar", length: 255 })
  testDescription: string;

  @Column({ type: "varchar", length: 50 })
  testType: string; // 'unit', 'integration', 'e2e'

  @Column({ type: "varchar", length: 50 })
  route: string; // '/api/users/register', '/api/users/login', etc.

  @Column({ type: "varchar", length: 10 })
  method: string; // 'GET', 'POST', 'PUT', 'DELETE'

  @Column({ type: "json", nullable: true })
  requestBody: any;

  @Column({ type: "json", nullable: true })
  expectedResponse: any;

  @Column({ type: "json", nullable: true })
  actualResponse: any;

  @Column({ type: "boolean", default: false })
  isPassed: boolean;

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @Column({ type: "integer", default: 0 })
  responseTime: number; // in milliseconds

  @Column({ type: "varchar", length: 20, default: 'pending' })
  status: 'pending' | 'running' | 'passed' | 'failed';

  @CreateDateColumn() // Automatically stores the creation date
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates when a record is updated
  updatedAt: Date;
}
