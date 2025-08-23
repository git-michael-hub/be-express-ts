/**
 * NOTE: any changes here should run migration
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'tasks' }) // Specifies the table name
export class Task {
  @PrimaryGeneratedColumn('uuid') // Automatically generate a unique ID
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dueDate: Date;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'high' })
  priority: 'low' | 'medium' | 'high';

  // to delete in favor of status field
  // @Column({ type: 'boolean', default: false })
  // isCompleted: boolean;

  @Column({ type: 'boolean', default: false })
  isArchive: boolean;

  @CreateDateColumn() // Automatically stores the creation date
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates when a record is updated
  updatedAt: Date;

  @Column({ type: 'enum', enum: ['todo', 'inprogress', 'done', 'block', 'inreview'] , default: 'todo' })
  status: 'todo' | 'inprogress' | 'done' | 'block' | 'inreview';

  // status -> in progress, done, block, in review 

  // isWatching -> if true, the user will notify on every update or comments

  // level -> level of difficulties or work duration

  // occurence
}

/**
 * For test purposes
 */
@Entity({ name: 'task_tests' }) // Specifies the table name
export class TaskTest {
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