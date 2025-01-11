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
  date: Date;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'high' })
  priority: 'low' | 'medium' | 'high';

  // to delete in favor of status field
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'boolean', default: false })
  isArchive: boolean;

  @CreateDateColumn() // Automatically stores the creation date
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates when a record is updated
  updatedAt: Date;

  // status -> in progress, done, block, in review 

  // isWatching -> if true, the user will notify on every update or comments
}


export default Task;
