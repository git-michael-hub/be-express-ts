import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import * as fs from 'fs';
import * as path from 'path';
import { Not, IsNull } from 'typeorm';

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  role: 'admin' | 'user';
  position: string[];
  team: string[];
  createdAt: string;
  updatedAt: string;
}

export class UserSeeder {
  private userRepository = AppDataSource.getRepository(User);

  async seed(): Promise<void> {
    try {
      console.log('🌱 Starting User Seeder...');

      // Check if database is connected
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Read mock data from JSON file
      const mockDataPath = path.join(__dirname, '../mock-data/1000_users.json');
      const mockData: UserData[] = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

      console.log(`📖 Found ${mockData.length} users in mock data file`);

      // Check if users already exist
      const existingUsersCount = await this.userRepository.count();
      if (existingUsersCount > 0) {
        console.log(`⚠️  Database already contains ${existingUsersCount} users`);
        const shouldContinue = process.argv.includes('--force');
        if (!shouldContinue) {
          console.log('💡 Use --force flag to overwrite existing data');
          return;
        }
        console.log('🗑️  Clearing existing users...');
        await this.userRepository.clear();
      }

      // Transform mock data to User entities
      const users = mockData.map(userData => {
        const user = new User();
        user.id = userData.id;
        user.name = userData.name;
        user.email = userData.email;
        user.password = userData.password; // Will be hashed by @BeforeInsert
        user.isEmailVerified = userData.isEmailVerified;
        user.lastLoginAt = userData.lastLoginAt ? new Date(userData.lastLoginAt) : null;
        user.role = userData.role;
        user.position = userData.position;
        user.team = userData.team;
        user.createdAt = new Date(userData.createdAt);
        user.updatedAt = new Date(userData.updatedAt);
        return user;
      });

      // Insert users in batches to avoid memory issues
      const batchSize = 50; // Smaller batch size for users due to password hashing
      let insertedCount = 0;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        // Save users one by one to ensure password hashing works properly
        for (const user of batch) {
          await this.userRepository.save(user);
          insertedCount++;
          
          if (insertedCount % 100 === 0) {
            console.log(`✅ Inserted ${insertedCount}/${users.length} users`);
          }
        }
      }

      console.log(`🎉 Successfully seeded ${insertedCount} users!`);

      // Verify the seeding
      const finalCount = await this.userRepository.count();
      console.log(`📊 Database now contains ${finalCount} users`);

    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('🗑️  Clearing all users...');
      await this.userRepository.clear();
      console.log('✅ All users cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing users:', error);
      throw error;
    }
  }

  async getStats(): Promise<void> {
    try {
      const totalUsers = await this.userRepository.count();
      const adminUsers = await this.userRepository.count({ where: { role: 'admin' } });
      const regularUsers = await this.userRepository.count({ where: { role: 'user' } });
      const verifiedUsers = await this.userRepository.count({ where: { isEmailVerified: true } });
      const unverifiedUsers = await this.userRepository.count({ where: { isEmailVerified: false } });
      const activeUsers = await this.userRepository.count({ where: { lastLoginAt: Not(IsNull()) } });

      console.log('📊 User Statistics:');
      console.log(`   Total Users: ${totalUsers}`);
      console.log(`   Admins: ${adminUsers} (${(adminUsers/totalUsers*100).toFixed(1)}%)`);
      console.log(`   Regular Users: ${regularUsers} (${(regularUsers/totalUsers*100).toFixed(1)}%)`);
      console.log(`   Email Verified: ${verifiedUsers} (${(verifiedUsers/totalUsers*100).toFixed(1)}%)`);
      console.log(`   Email Unverified: ${unverifiedUsers} (${(unverifiedUsers/totalUsers*100).toFixed(1)}%)`);
      console.log(`   Active Users (with login): ${activeUsers} (${(activeUsers/totalUsers*100).toFixed(1)}%)`);

      // Get position statistics
      const usersWithPositions = await this.userRepository.find();
      const positionCounts: { [key: string]: number } = {};
      const teamCounts: { [key: string]: number } = {};

      usersWithPositions.forEach(user => {
        user.position.forEach(pos => {
          positionCounts[pos] = (positionCounts[pos] || 0) + 1;
        });
        user.team.forEach(team => {
          teamCounts[team] = (teamCounts[team] || 0) + 1;
        });
      });

      console.log('\n🏢 Top 10 Positions:');
      Object.entries(positionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([position, count]) => {
          console.log(`   ${position}: ${count} users`);
        });

      console.log('\n👥 Top 10 Teams:');
      Object.entries(teamCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([team, count]) => {
          console.log(`   ${team}: ${count} users`);
        });

    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  async verifyPasswords(): Promise<void> {
    try {
      console.log('�� Verifying password hashing...');
      
      const users = await this.userRepository.find({ take: 5 });
      let verifiedCount = 0;
      
      for (const user of users) {
        const isValid = await user.comparePassword('SecurePass123!');
        if (isValid) {
          verifiedCount++;
          console.log(`✅ User ${user.email}: Password correctly hashed`);
        } else {
          console.log(`❌ User ${user.email}: Password verification failed`);
        }
      }
      
      console.log(`🔐 Password verification: ${verifiedCount}/${users.length} users passed`);
      
    } catch (error) {
      console.error('❌ Error verifying passwords:', error);
      throw error;
    }
  }

  async createTestUser(): Promise<User> {
    try {
      console.log('�� Creating test user...');
      
      const testUser = new User();
      testUser.name = 'Test User';
      testUser.email = 'test@example.com';
      testUser.password = 'TestPass123!';
      testUser.role = 'user';
      testUser.position = ['Developer'];
      testUser.team = ['Development'];
      
      const savedUser = await this.userRepository.save(testUser);
      console.log(`✅ Test user created: ${savedUser.email}`);
      
      return savedUser;
      
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const seeder = new UserSeeder();
  
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

    case 'verify':
      seeder.verifyPasswords()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Password verification failed:', error);
          process.exit(1);
        });
      break;

    case 'test-user':
      seeder.createTestUser()
        .then(() => {
          console.log('✅ Test user creation completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Test user creation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run seed:users     - Seed users from mock data');
      console.log('  npm run clear:users    - Clear all users');
      console.log('  npm run stats:users    - Show user statistics');
      console.log('  npm run verify:users   - Verify password hashing');
      console.log('  npm run test-user      - Create a test user');
      console.log('');
      console.log('Options:');
      console.log('  --force               - Force overwrite existing data');
      process.exit(0);
  }
}