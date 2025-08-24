import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';
import * as fs from 'fs';
import * as path from 'path';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  members: string[];
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

export class ProjectSeeder {
  private projectRepository = AppDataSource.getRepository(Project);

  async seed(): Promise<void> {
    try {
      console.log('🌱 Starting Project Seeder...');

      // Check if database is connected
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Read mock data from JSON file
      const mockDataPath = path.join(__dirname, '../mock-data/100_projects.json');
      const mockData: ProjectData[] = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

      console.log(`📖 Found ${mockData.length} projects in mock data file`);

      // Check if projects already exist
      const existingProjectsCount = await this.projectRepository.count();
      if (existingProjectsCount > 0) {
        console.log(`⚠️  Database already contains ${existingProjectsCount} projects`);
        const shouldContinue = process.argv.includes('--force');
        if (!shouldContinue) {
          console.log('💡 Use --force flag to overwrite existing data');
          return;
        }
        console.log('🗑️  Clearing existing projects...');
        await this.projectRepository.clear();
      }

      // Transform mock data to Project entities
      const projects = mockData.map(projectData => {
        const project = new Project();
        project.id = projectData.id;
        project.name = projectData.name;
        project.description = projectData.description;
        project.dueDate = projectData.dueDate ? new Date(projectData.dueDate) : null;
        project.members = projectData.members;
        project.tasks = projectData.tasks;
        project.createdAt = new Date(projectData.createdAt);
        project.updatedAt = new Date(projectData.updatedAt);
        return project;
      });

      // Insert projects in batches to avoid memory issues
      const batchSize = 20; // Smaller batch size for projects
      let insertedCount = 0;

      for (let i = 0; i < projects.length; i += batchSize) {
        const batch = projects.slice(i, i + batchSize);
        await this.projectRepository.save(batch);
        insertedCount += batch.length;
        console.log(`✅ Inserted ${insertedCount}/${projects.length} projects`);
      }

      console.log(`🎉 Successfully seeded ${insertedCount} projects!`);

      // Verify the seeding
      const finalCount = await this.projectRepository.count();
      console.log(`📊 Database now contains ${finalCount} projects`);

    } catch (error) {
      console.error('❌ Error seeding projects:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('🗑️  Clearing all projects...');
      await this.projectRepository.clear();
      console.log('✅ All projects cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing projects:', error);
      throw error;
    }
  }

  async getStats(): Promise<void> {
    try {
      const totalProjects = await this.projectRepository.count();
      
      // Get all projects to analyze members and tasks
      const allProjects = await this.projectRepository.find();
      
      // Calculate statistics
      const totalMembers = allProjects.reduce((sum, project) => sum + project.members.length, 0);
      const totalTasks = allProjects.reduce((sum, project) => sum + project.tasks.length, 0);
      const avgMembers = totalProjects > 0 ? (totalMembers / totalProjects).toFixed(1) : '0';
      const avgTasks = totalProjects > 0 ? (totalTasks / totalProjects).toFixed(1) : '0';
      
      // Find projects with most members and tasks
      const projectWithMostMembers = allProjects.reduce((max, project) => 
        project.members.length > max.members.length ? project : max, allProjects[0]);
      
      const projectWithMostTasks = allProjects.reduce((max, project) => 
        project.tasks.length > max.tasks.length ? project : max, allProjects[0]);

      console.log('�� Project Statistics:');
      console.log(`   Total Projects: ${totalProjects}`);
      console.log(`   Total Members Assigned: ${totalMembers}`);
      console.log(`   Total Tasks Assigned: ${totalTasks}`);
      console.log(`   Average Members per Project: ${avgMembers}`);
      console.log(`   Average Tasks per Project: ${avgTasks}`);
      
      if (projectWithMostMembers) {
        console.log(`   Project with Most Members: "${projectWithMostMembers.name}" (${projectWithMostMembers.members.length} members)`);
      }
      
      if (projectWithMostTasks) {
        console.log(`   Project with Most Tasks: "${projectWithMostTasks.name}" (${projectWithMostTasks.tasks.length} tasks)`);
      }

      // Show projects by creation date range
      const recentProjects = allProjects.filter(p => 
        new Date(p.createdAt) > new Date('2024-01-10')
      ).length;
      
      const olderProjects = allProjects.filter(p => 
        new Date(p.createdAt) <= new Date('2024-01-10')
      ).length;

      console.log(`\n📅 Projects by Creation Date:`);
      console.log(`   Recent Projects (after Jan 10): ${recentProjects}`);
      console.log(`   Older Projects (Jan 1-10): ${olderProjects}`);

      // Show projects by due date
      const upcomingProjects = allProjects.filter(p => 
        p.dueDate && new Date(p.dueDate) > new Date()
      ).length;
      
      const overdueProjects = allProjects.filter(p => 
        p.dueDate && new Date(p.dueDate) < new Date()
      ).length;

      console.log(`\n⏰ Projects by Due Date:`);
      console.log(`   Upcoming Projects: ${upcomingProjects}`);
      console.log(`   Overdue Projects: ${overdueProjects}`);

    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  async validateRelationships(): Promise<void> {
    try {
      console.log('�� Validating project relationships...');
      
      const projects = await this.projectRepository.find();
      let validProjects = 0;
      let invalidProjects = 0;
      
      for (const project of projects) {
        const isValid = project.members.length > 0 && project.tasks.length > 0;
        if (isValid) {
          validProjects++;
        } else {
          invalidProjects++;
          console.log(`⚠️  Project "${project.name}" has ${project.members.length} members and ${project.tasks.length} tasks`);
        }
      }
      
      console.log(`✅ Relationship validation: ${validProjects} valid, ${invalidProjects} invalid projects`);
      
    } catch (error) {
      console.error('❌ Error validating relationships:', error);
      throw error;
    }
  }

  async createTestProject(): Promise<Project> {
    try {
      console.log('🧪 Creating test project...');
      
      const testProject = new Project();
      testProject.name = 'Test Project';
      testProject.description = 'A test project for development purposes';
      testProject.dueDate = new Date('2024-12-31');
      testProject.members = ['test-user-id-1', 'test-user-id-2'];
      testProject.tasks = ['test-task-id-1', 'test-task-id-2'];
      
      const savedProject = await this.projectRepository.save(testProject);
      console.log(`✅ Test project created: ${savedProject.name}`);
      
      return savedProject;
      
    } catch (error) {
      console.error('❌ Error creating test project:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const seeder = new ProjectSeeder();
  
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

    case 'validate':
      seeder.validateRelationships()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Validation failed:', error);
          process.exit(1);
        });
      break;

    case 'test-project':
      seeder.createTestProject()
        .then(() => {
          console.log('✅ Test project creation completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Test project creation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run seed:projects     - Seed projects from mock data');
      console.log('  npm run clear:projects    - Clear all projects');
      console.log('  npm run stats:projects    - Show project statistics');
      console.log('  npm run validate:projects - Validate project relationships');
      console.log('  npm run test-project      - Create a test project');
      console.log('');
      console.log('Options:');
      console.log('  --force               - Force overwrite existing data');
      process.exit(0);
  }
}