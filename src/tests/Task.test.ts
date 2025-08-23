import request from 'supertest';
import { AppDataSource } from '../data-source';
import { Task, TaskTest } from '../entities/Task';
// import { APP } from '../main';
// import { getGlobalTestServer, closeGlobalTestServer } from './test-server';
import { createTestServer, closeTestServer } from './test-server';


// const { app } = getGlobalTestServer();

describe('Task Routes Tests', () => {
  let testTask: Task;
  let taskTestRepository: any;
  let createdTaskIds: string[] = [];
  let app;
  let server: any;

  beforeAll(async () => {
    // Create test server on port 3002
    const testServer = createTestServer(3002);
    app = testServer.app;
    server = testServer.server;

    // Initialize database connection
    await AppDataSource.initialize();
    taskTestRepository = AppDataSource.getRepository(TaskTest);
  }, 30000);

  afterAll(async () => {
    // Clean up all test data and close connection
    await cleanupTestData();
    await AppDataSource.destroy();
    await closeTestServer(3002);
  }, 30000);

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
      // Delete all test tasks
      await AppDataSource.getRepository(Task).clear();
      // Delete all test results
      await taskTestRepository.clear();
      // Reset the tracking array
      createdTaskIds = [];
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  };

  // Helper function to create test task and track it
  const createTestTask = async (taskData: any) => {
    const taskRepository = AppDataSource.getRepository(Task);
    const newTask = taskRepository.create(taskData);
    const savedTask = await taskRepository.save(newTask) as unknown as Task;
    createdTaskIds.push(savedTask.id);
    return savedTask;
  };

  describe('GET /api/tasks', () => {
    it('should get all tasks successfully', async () => {
      const startTime = Date.now();
      const testData = {
        testName: 'Get All Tasks Success',
        testDescription: 'Test retrieving all tasks from the database',
        testType: 'integration',
        route: '/api/tasks',
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          isArray: true
        }
      };

      try {
        // Create some test tasks first
        await createTestTask({
          title: 'Test Task 1',
          description: 'First test task',
          dueDate: new Date('2024-12-31'),
          priority: 'high',
          status: 'todo'
        });

        await createTestTask({
          title: 'Test Task 2',
          description: 'Second test task',
          dueDate: new Date('2024-12-30'),
          priority: 'medium',
          status: 'inprogress'
        });

        const response = await request(app)
          .get('/api/tasks')
          .expect(200);

        const responseTime = Date.now() - startTime;
        const isPassed = response.status === 200 && Array.isArray(response.body);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed,
          responseTime,
          status: isPassed ? 'passed' : 'failed'
        });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should return empty array when no tasks exist', async () => {
      const testData = {
        testName: 'Get All Tasks Empty',
        testDescription: 'Test retrieving tasks when database is empty',
        testType: 'unit',
        route: '/api/tasks',
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          isArray: true,
          isEmpty: true
        }
      };

      try {
        const response = await request(app)
          .get('/api/tasks')
          .expect(200);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && Array.isArray(response.body),
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      } catch (error) {
        await taskTestRepository.save({
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

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const startTime = Date.now();
      const testData = {
        testName: 'Create New Task Success',
        testDescription: 'Test creating a new task with valid data including title, description, dueDate, priority, and status',
        testType: 'integration',
        route: '/api/tasks',
        method: 'POST',
        requestBody: {
          title: 'Complete Project Documentation',
          description: 'Write comprehensive documentation for the project',
          dueDate: '2024-12-31T23:59:59.000Z',
          priority: 'high',
          status: 'todo'
        },
        expectedResponse: {
          status: 201,
          hasTask: true,
          hasId: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/tasks')
          .send(testData.requestBody)
          .expect(201);

        const responseTime = Date.now() - startTime;
        const isPassed = response.status === 201 && 
                        response.body.title === testData.requestBody.title &&
                        Boolean(response.body.id);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed,
          responseTime,
          status: isPassed ? 'passed' : 'failed'
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(testData.requestBody.title);
        expect(response.body.description).toBe(testData.requestBody.description);
        expect(response.body.priority).toBe(testData.requestBody.priority);
        expect(response.body.status).toBe(testData.requestBody.status);
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail creation with missing required fields', async () => {
      const testData = {
        testName: 'Create Task Missing Required Fields',
        testDescription: 'Test creating a task without required fields to ensure proper validation',
        testType: 'unit',
        route: '/api/tasks',
        method: 'POST',
        requestBody: {
          description: 'Task without title',
          priority: 'medium'
        },
        expectedResponse: {
          status: 400,
          hasErrors: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/tasks')
          .send(testData.requestBody)
          .expect(400);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail creation with invalid priority', async () => {
      const testData = {
        testName: 'Create Task Invalid Priority',
        testDescription: 'Test creating a task with invalid priority value to ensure enum validation',
        testType: 'unit',
        route: '/api/tasks',
        method: 'POST',
        requestBody: {
          title: 'Test Task',
          description: 'Test description',
          dueDate: '2024-12-31T23:59:59.000Z',
          priority: 'invalid_priority',
          status: 'todo'
        },
        expectedResponse: {
          status: 400,
          hasErrors: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/tasks')
          .send(testData.requestBody)
          .expect(400);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await taskTestRepository.save({
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

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task for update tests
      testTask = await createTestTask({
        title: 'Original Task Title',
        description: 'Original description',
        dueDate: new Date('2024-12-31'),
        priority: 'low',
        status: 'todo'
      });
    });

    it('should update task successfully', async () => {
      const testData = {
        testName: 'Update Task Success',
        testDescription: 'Test updating task information with valid data and authentication',
        testType: 'integration',
        route: `/api/tasks/${testTask.id}`,
        method: 'PUT',
        requestBody: {
          title: 'Updated Task Title',
          description: 'Updated description',
          priority: 'high',
          status: 'inprogress'
        },
        expectedResponse: {
          status: 200,
          updatedTitle: 'Updated Task Title'
        }
      };

      try {
        const response = await request(app)
          .put(`/api/tasks/${testTask.id}`)
          .send(testData.requestBody)
          .expect(200);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.title === testData.requestBody.title,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body.title).toBe(testData.requestBody.title);
        expect(response.body.description).toBe(testData.requestBody.description);
        expect(response.body.priority).toBe(testData.requestBody.priority);
        expect(response.body.status).toBe(testData.requestBody.status);
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail update with invalid task ID', async () => {
      const testData = {
        testName: 'Update Task Invalid ID',
        testDescription: 'Test updating task with non-existent ID to ensure proper error handling',
        testType: 'unit',
        route: '/api/tasks/invalid-uuid',
        method: 'PUT',
        requestBody: {
          title: 'Updated Title'
        },
        expectedResponse: {
          status: 400,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .put('/api/tasks/invalid-uuid')
          .send(testData.requestBody)
          .expect(400);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail update with non-existent task', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Update Non-existent Task',
        testDescription: 'Test updating a task that does not exist in the database',
        testType: 'unit',
        route: `/api/tasks/${nonExistentId}`,
        method: 'PUT',
        requestBody: {
          title: 'Updated Title'
        },
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .put(`/api/tasks/${nonExistentId}`)
          .send(testData.requestBody)
          .expect(404);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Task not found');
      } catch (error) {
        await taskTestRepository.save({
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

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task for delete tests
      testTask = await createTestTask({
        title: 'Task to Delete',
        description: 'This task will be deleted',
        dueDate: new Date('2024-12-31'),
        priority: 'medium',
        status: 'todo'
      });
    });

    it('should delete task successfully', async () => {
      const testData = {
        testName: 'Delete Task Success',
        testDescription: 'Test deleting a task with valid ID and authentication',
        testType: 'integration',
        route: `/api/tasks/${testTask.id}`,
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasMessage: true
        }
      };

      try {
        const response = await request(app)
          .delete(`/api/tasks/${testTask.id}`)
          .expect(200);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('dueDate');
        expect(response.body).toHaveProperty('priority');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('isArchive');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail delete with invalid task ID', async () => {
      const testData = {
        testName: 'Delete Task Invalid ID',
        testDescription: 'Test deleting task with invalid UUID format to ensure proper validation',
        testType: 'unit',
        route: '/api/tasks/invalid-uuid',
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 400,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .delete('/api/tasks/invalid-uuid')
          .expect(400);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail delete with non-existent task', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Delete Non-existent Task',
        testDescription: 'Test deleting a task that does not exist in the database',
        testType: 'unit',
        route: `/api/tasks/${nonExistentId}`,
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .delete(`/api/tasks/${nonExistentId}`)
          .expect(404);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Task not found');
      } catch (error) {
        await taskTestRepository.save({
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

  describe('Task Status Transitions', () => {
    beforeEach(async () => {
      testTask = await createTestTask({
        title: 'Status Test Task',
        description: 'Task for testing status transitions',
        dueDate: new Date('2024-12-31'),
        priority: 'high',
        status: 'todo'
      });
    });

    it('should transition from todo to inprogress', async () => {
      const testData = {
        testName: 'Task Status Transition Todo to InProgress',
        testDescription: 'Test updating task status from todo to inprogress',
        testType: 'integration',
        route: `/api/tasks/${testTask.id}`,
        method: 'PUT',
        requestBody: {
          status: 'inprogress'
        },
        expectedResponse: {
          status: 200,
          newStatus: 'inprogress'
        }
      };

      try {
        const response = await request(app)
          .put(`/api/tasks/${testTask.id}`)
          .send(testData.requestBody)
          .expect(200);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.status === 'inprogress',
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body.status).toBe('inprogress');
      } catch (error) {
        await taskTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should transition from inprogress to done', async () => {
      // First update to inprogress
      await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .send({ status: 'inprogress' });

      const testData = {
        testName: 'Task Status Transition InProgress to Done',
        testDescription: 'Test updating task status from inprogress to done',
        testType: 'integration',
        route: `/api/tasks/${testTask.id}`,
        method: 'PUT',
        requestBody: {
          status: 'done'
        },
        expectedResponse: {
          status: 200,
          newStatus: 'done'
        }
      };

      try {
        const response = await request(app)
          .put(`/api/tasks/${testTask.id}`)
          .send(testData.requestBody)
          .expect(200);

        await taskTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.status === 'done',
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body.status).toBe('done');
      } catch (error) {
        await taskTestRepository.save({
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
      const testResults = await taskTestRepository.find();
      const passedTests = testResults.filter(test => test.isPassed);
      const failedTests = testResults.filter(test => !test.isPassed);
      
      console.log(`\n=== Task Routes Test Summary ===`);
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