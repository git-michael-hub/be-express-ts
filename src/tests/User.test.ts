import request from 'supertest';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { UserTest } from '../entities/User';
import { AuthService } from '../services/auth.service';
import { APP } from '../main'; // Assuming you export app from main.ts

const authService = new AuthService();

describe('User Routes Tests', () => {
  let testUser: User;
  let authToken: string;
  let userTestRepository: any;
  let createdUserIds: string[] = []; // Track created users

  beforeAll(async () => {
    // Initialize database connection
    await AppDataSource.initialize();
    userTestRepository = AppDataSource.getRepository(UserTest);
  });

  afterAll(async () => {
    // Clean up all test data and close connection
    await cleanupTestData();
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });



  // Helper function to clean up test data
  const cleanupTestData = async () => {
    try {
        // Delete all test users
        await AppDataSource.getRepository(User).clear();
        // Delete all test results
        await userTestRepository.clear();
        // Reset the tracking array
        createdUserIds = [];
    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
  };

  // Helper function to create test user and track it
  const createTestUser = async (userData: any) => {
    const registeredUser = await authService.register(userData);
    const fullUser = await AppDataSource.getRepository(User).findOneBy({ id: registeredUser.id });
    createdUserIds.push(fullUser.id);
    return fullUser;
  };



  describe('POST /api/users/register', () => {
    it.only('should register a new user successfully', async () => {
        const startTime = Date.now();
        const testData = {
          testName: 'Register New User Success',
          testType: 'integration',
          route: '/api/users/register',
          method: 'POST',
          requestBody: {
            name: 'Test User',
            email: 'test@example.com',
            password: 'SecurePass123!',
            role: 'user',
            position: ['Developer'],
            team: ['Frontend']
          },
          expectedResponse: {
            status: 201,
            hasUser: true,
            hasPassword: false
          }
        };
  
        try {
          const response = await request(APP)
            .post('/api/users/register')
            .send(testData.requestBody)
            .expect(201);
  
          const responseTime = Date.now() - startTime;
          const isPassed = response.status === 201 && 
                          response.body.name === testData.requestBody.name &&
                          !response.body.password;
  
          // Save test result
          await userTestRepository.save({
            ...testData,
            actualResponse: response.body,
            isPassed,
            responseTime,
            status: isPassed ? 'passed' : 'failed'
          });
  
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe(testData.requestBody.name);
          expect(response.body).not.toHaveProperty('password');
        } catch (error) {
          await userTestRepository.save({
            ...testData,
            actualResponse: { error: error.message },
            isPassed: false,
            errorMessage: error.message,
            status: 'failed'
          });
          throw error;
        }
      });

    it('should fail registration with invalid email', async () => {
      const testData = {
        testName: 'Register User Invalid Email',
        testType: 'unit',
        route: '/api/users/register',
        method: 'POST',
        requestBody: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'SecurePass123!'
        },
        expectedResponse: {
          status: 400,
          hasErrors: true
        }
      };

      try {
        const response = await request(APP)
          .post('/api/users/register')
          .send(testData.requestBody)
          .expect(400);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await createTestUser({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'SecurePass123!'
      });
    });

    it('should login user successfully', async () => {
      const testData = {
        testName: 'User Login Success',
        testType: 'integration',
        route: '/api/users/login',
        method: 'POST',
        requestBody: {
          email: 'login@example.com',
          password: 'SecurePass123!'
        },
        expectedResponse: {
          status: 200,
          hasToken: true,
          hasUser: true
        }
      };

      try {
        const response = await request(APP)
          .post('/api/users/login')
          .send(testData.requestBody)
          .expect(200);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.token,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(testData.requestBody.email);
        
        authToken = response.body.token; // Save for other tests
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail login with wrong password', async () => {
      const testData = {
        testName: 'User Login Wrong Password',
        testType: 'unit',
        route: '/api/users/login',
        method: 'POST',
        requestBody: {
          email: 'login@example.com',
          password: 'WrongPassword123!'
        },
        expectedResponse: {
          status: 401,
          hasError: true
        }
      };

      try {
        const response = await request(APP)
          .post('/api/users/login')
          .send(testData.requestBody)
          .expect(401);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 401,
          status: response.status === 401 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('GET /api/users/me', () => {
    beforeEach(async () => {
        // Create user and get token
        testUser = await createTestUser({
          name: 'Me Test User',
          email: 'me@example.com',
          password: 'SecurePass123!'
        });
  
        const loginResponse = await authService.login('me@example.com', 'SecurePass123!');
        authToken = loginResponse.token;
    });

    it('should get current user profile', async () => {
      const testData = {
        testName: 'Get Current User Profile',
        testType: 'integration',
        route: '/api/users/me',
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasUser: true,
          noPassword: true
        }
      };

      try {
        const response = await request(APP)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && !response.body.password,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email');
        expect(response.body).not.toHaveProperty('password');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail without authentication token', async () => {
      const testData = {
        testName: 'Get Current User No Token',
        testType: 'unit',
        route: '/api/users/me',
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 401,
          hasError: true
        }
      };

      try {
        const response = await request(APP)
          .get('/api/users/me')
          .expect(401);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 401,
          status: response.status === 401 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('PUT /api/users/:id', () => {
    beforeEach(async () => {
        // Create user and get token
        testUser = await createTestUser({
          name: 'Update Test User',
          email: 'update@example.com',
          password: 'SecurePass123!'
        });
        
        const loginResponse = await authService.login('update@example.com', 'SecurePass123!');
        authToken = loginResponse.token;
    });

    it('should update user successfully', async () => {
      const testData = {
        testName: 'Update User Success',
        testType: 'integration',
        route: `/api/users/${testUser.id}`,
        method: 'PUT',
        requestBody: {
          name: 'Updated User Name',
          position: ['Senior Developer'],
          team: ['Backend', 'DevOps']
        },
        expectedResponse: {
          status: 200,
          updatedName: 'Updated User Name'
        }
      };

      try {
        const response = await request(APP)
          .put(`/api/users/${testUser.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(testData.requestBody)
          .expect(200);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.name === testData.requestBody.name,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body.name).toBe(testData.requestBody.name);
        expect(response.body.position).toEqual(testData.requestBody.position);
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('DELETE /api/users/:id', () => {
    beforeEach(async () => {
        // Create user and get token
        testUser = await createTestUser({
          name: 'Delete Test User',
          email: 'delete@example.com',
          password: 'SecurePass123!'
        });
  
        const loginResponse = await authService.login('delete@example.com', 'SecurePass123!');
        authToken = loginResponse.token;
    });

    it('should delete user successfully', async () => {
      const testData = {
        testName: 'Delete User Success',
        testType: 'integration',
        route: `/api/users/${testUser.id}`,
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasMessage: true
        }
      };

      try {
        const response = await request(APP)
          .delete(`/api/users/${testUser.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('POST /api/users/logout', () => {
    beforeEach(async () => {
        // Create user and get token
        testUser = await createTestUser({
          name: 'Logout Test User',
          email: 'logout@example.com',
          password: 'SecurePass123!'
        });
  
        const loginResponse = await authService.login('logout@example.com', 'SecurePass123!');
        authToken = loginResponse.token;
    });

    it('should logout user successfully', async () => {
      const testData = {
        testName: 'User Logout Success',
        testType: 'integration',
        route: '/api/users/logout',
        method: 'POST',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasMessage: true
        }
      };

      try {
        const response = await request(APP)
          .post('/api/users/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        await userTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Logged out successfully');
      } catch (error) {
        await userTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });
  });

  describe('Test Results Summary', () => {
    it('should generate test summary', async () => {
      const testResults = await userTestRepository.find();
      const passedTests = testResults.filter(test => test.isPassed);
      const failedTests = testResults.filter(test => !test.isPassed);
      
      console.log(`\n=== User Routes Test Summary ===`);
      console.log(`Total Tests: ${testResults.length}`);
      console.log(`Passed: ${passedTests.length}`);
      console.log(`Failed: ${failedTests.length}`);
      console.log(`Success Rate: ${((passedTests.length / testResults.length) * 100).toFixed(2)}%`);
      
      if (failedTests.length > 0) {
        console.log('\nFailed Tests:');
        failedTests.forEach(test => {
          console.log(`- ${test.testName}: ${test.errorMessage || 'Unknown error'}`);
        });
      }
    });
  });
});