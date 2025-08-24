import { AppDataSource } from '../data-source';
import { Task } from '../entities/Task';
import * as fs from 'fs';
import * as path from 'path';

interface TaskData {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isArchive: boolean;
  status: 'todo' | 'inprogress' | 'done' | 'block' | 'inreview';
  createdAt: string;
  updatedAt: string;
}

export class TaskSeeder {
  private taskRepository = AppDataSource.getRepository(Task);

  async seed(): Promise<void> {
    try {
      console.log('🌱 Starting Task Seeder...');

      // Check if database is connected
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Read mock data from JSON file
      const mockDataPath = path.join(__dirname, '../mock-data/5000_tasks.json');
      const mockData: TaskData[] = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

      console.log(`📖 Found ${mockData.length} tasks in mock data file`);

      // Check if tasks already exist
      const existingTasksCount = await this.taskRepository.count();
      if (existingTasksCount > 0) {
        console.log(`⚠️  Database already contains ${existingTasksCount} tasks`);
        const shouldContinue = process.argv.includes('--force');
        if (!shouldContinue) {
          console.log('💡 Use --force flag to overwrite existing data');
          return;
        }
        console.log('🗑️  Clearing existing tasks...');
        await this.taskRepository.clear();
      }

      // Transform mock data to Task entities
      const tasks = mockData.map(taskData => {
        const task = new Task();
        task.id = taskData.id;
        task.title = taskData.title;
        task.description = taskData.description;
        task.dueDate = new Date(taskData.dueDate);
        task.priority = taskData.priority;
        task.isArchive = taskData.isArchive;
        task.status = taskData.status;
        task.createdAt = new Date(taskData.createdAt);
        task.updatedAt = new Date(taskData.updatedAt);
        return task;
      });

      // Insert tasks in batches to avoid memory issues
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        await this.taskRepository.save(batch);
        insertedCount += batch.length;
        console.log(`✅ Inserted ${insertedCount}/${tasks.length} tasks`);
      }

      console.log(`🎉 Successfully seeded ${insertedCount} tasks!`);

      // Verify the seeding
      const finalCount = await this.taskRepository.count();
      console.log(`📊 Database now contains ${finalCount} tasks`);

    } catch (error) {
      console.error('❌ Error seeding tasks:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('�� Clearing all tasks...');
      await this.taskRepository.clear();
      console.log('✅ All tasks cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing tasks:', error);
      throw error;
    }
  }

  async getStats(): Promise<void> {
    try {
      const totalTasks = await this.taskRepository.count();
      const todoTasks = await this.taskRepository.count({ where: { status: 'todo' } });
      const inProgressTasks = await this.taskRepository.count({ where: { status: 'inprogress' } });
      const doneTasks = await this.taskRepository.count({ where: { status: 'done' } });
      const blockedTasks = await this.taskRepository.count({ where: { status: 'block' } });
      const inReviewTasks = await this.taskRepository.count({ where: { status: 'inreview' } });
      const archivedTasks = await this.taskRepository.count({ where: { isArchive: true } });

      console.log('📊 Task Statistics:');
      console.log(`   Total Tasks: ${totalTasks}`);
      console.log(`   Todo: ${todoTasks}`);
      console.log(`   In Progress: ${inProgressTasks}`);
      console.log(`   Done: ${doneTasks}`);
      console.log(`   Blocked: ${blockedTasks}`);
      console.log(`   In Review: ${inReviewTasks}`);
      console.log(`   Archived: ${archivedTasks}`);
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const seeder = new TaskSeeder();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      seeder.seed()
        .then(() => {
          console.log('✅ Seeding completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Seeding failed:', error);
          process.exit(1);
        });
      break;
      
    case 'clear':
      seeder.clear()
        .then(() => {
          console.log('✅ Clearing completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Clearing failed:', error);
          process.exit(1);
        });
      break;
      
    case 'stats':
      seeder.getStats()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Getting stats failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run seed:tasks     - Seed tasks from mock data');
      console.log('  npm run clear:tasks    - Clear all tasks');
      console.log('  npm run stats:tasks    - Show task statistics');
      console.log('');
      console.log('Options:');
      console.log('  --force               - Force overwrite existing data');
      process.exit(0);
  }
}