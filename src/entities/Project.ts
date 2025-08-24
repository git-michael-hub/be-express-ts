/**
 * NOTE: any changes here should run migration
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'projects' }) // Specifies the table name
export class Project {
  @PrimaryGeneratedColumn('uuid') // Automatically generate a unique ID
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "timestamp", nullable: true })
  dueDate: Date;

  @Column({ type: "varchar", array: true, length: 100, nullable: true })
  members: string[]; // Array of user IDs

  @Column({ type: "varchar", array: true, length: 100, nullable: true })
  tasks: string[]; // Array of task IDs

  @CreateDateColumn() // Automatically stores the creation date
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates when a record is updated
  updatedAt: Date;
}



/**
 * For test purposes
 */
@Entity({ name: 'project_tests' }) // Specifies the table name
export class ProjectTest {
  @PrimaryGeneratedColumn('uuid') // Automatically generate a unique ID
  id: string;

  @Column({ type: "varchar", length: 100 })
  testName: string;

  @Column({ type: "varchar", length: 255 })
  testDescription: string;

  @Column({ type: "varchar", length: 50 })
  testType: string; // 'unit', 'integration', 'e2e'

  @Column({ type: "varchar", length: 100 })
  route: string; // '/api/projects', '/api/projects/:id', etc.

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