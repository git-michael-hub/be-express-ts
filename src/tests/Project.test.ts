import request from 'supertest';
import { AppDataSource } from '../data-source';
import { Project, ProjectTest } from '../entities/Project';
import { createTestServer, closeTestServer } from './test-server';

describe('Project Routes Tests', () => {
  let testProject: Project;
  let projectTestRepository: any;
  let createdProjectIds: string[] = [];
  let app;
  let server: any;

  beforeAll(async () => {
    // Create test server on port 3003
    const testServer = createTestServer(3003);
    app = testServer.app;
    server = testServer.server;

    // Initialize database connection
    await AppDataSource.initialize();
    projectTestRepository = AppDataSource.getRepository(ProjectTest);
  }, 30000);

  afterAll(async () => {
    // Clean up all test data and close connection
    await cleanupTestData();
    await AppDataSource.destroy();
    await closeTestServer(3003);
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
      // Delete all test projects
      await AppDataSource.getRepository(Project).clear();
      // Delete all test results
      await projectTestRepository.clear();
      // Reset the tracking array
      createdProjectIds = [];
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  };

  // Helper function to create test project and track it
  const createTestProject = async (projectData: any) => {
    const projectRepository = AppDataSource.getRepository(Project);
    const newProject = projectRepository.create(projectData);
    const savedProject = await projectRepository.save(newProject) as unknown as Project;
    createdProjectIds.push(savedProject.id);
    return savedProject;
  };

  describe('GET /api/projects', () => {
    it('should get all projects successfully', async () => {
      const startTime = Date.now();
      const testData = {
        testName: 'Get All Projects Success',
        testDescription: 'Test retrieving all projects from the database',
        testType: 'integration',
        route: '/api/projects',
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          isArray: true
        }
      };

      try {
        // Create some test projects first
        await createTestProject({
          name: 'Test Project 1',
          description: 'First test project',
          dueDate: new Date('2024-12-31'),
          members: ['user-1', 'user-2'],
          tasks: ['task-1', 'task-2']
        });

        await createTestProject({
          name: 'Test Project 2',
          description: 'Second test project',
          dueDate: new Date('2024-12-30'),
          members: ['user-3'],
          tasks: ['task-3']
        });

        const response = await request(app)
          .get('/api/projects')
          .expect(200);

        const responseTime = Date.now() - startTime;
        const isPassed = response.status === 200 && Array.isArray(response.body);

        await projectTestRepository.save({
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
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should return empty array when no projects exist', async () => {
      const testData = {
        testName: 'Get All Projects Empty',
        testDescription: 'Test retrieving projects when database is empty',
        testType: 'unit',
        route: '/api/projects',
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
          .get('/api/projects')
          .expect(200);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && Array.isArray(response.body),
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      } catch (error) {
        await projectTestRepository.save({
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

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const startTime = Date.now();
      const testData = {
        testName: 'Create New Project Success',
        testDescription: 'Test creating a new project with valid data including name, description, dueDate, members, and tasks',
        testType: 'integration',
        route: '/api/projects',
        method: 'POST',
        requestBody: {
          name: 'E-commerce Platform',
          description: 'Build a modern e-commerce platform with React and Node.js',
          dueDate: '2024-12-31T23:59:59.000Z',
          members: ['user-1', 'user-2', 'user-3'],
          tasks: ['task-1', 'task-2']
        },
        expectedResponse: {
          status: 201,
          hasProject: true,
          hasId: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/projects')
          .send(testData.requestBody)
          .expect(201);

        const responseTime = Date.now() - startTime;
        const isPassed = response.status === 201 && 
                        response.body.name === testData.requestBody.name &&
                        Boolean(response.body.id);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed,
          responseTime,
          status: isPassed ? 'passed' : 'failed'
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(testData.requestBody.name);
        expect(response.body.description).toBe(testData.requestBody.description);
        expect(response.body.members).toEqual(testData.requestBody.members);
        expect(response.body.tasks).toEqual(testData.requestBody.tasks);
      } catch (error) {
        await projectTestRepository.save({
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
        testName: 'Create Project Missing Required Fields',
        testDescription: 'Test creating a project without required name field to ensure proper validation',
        testType: 'unit',
        route: '/api/projects',
        method: 'POST',
        requestBody: {
          description: 'Project without name',
          members: ['user-1']
        },
        expectedResponse: {
          status: 400,
          hasErrors: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/projects')
          .send(testData.requestBody)
          .expect(400);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail creation with invalid date format', async () => {
      const testData = {
        testName: 'Create Project Invalid Date Format',
        testDescription: 'Test creating a project with invalid dueDate format to ensure proper validation',
        testType: 'unit',
        route: '/api/projects',
        method: 'POST',
        requestBody: {
          name: 'Test Project',
          description: 'Test description',
          dueDate: 'invalid-date',
          members: ['user-1']
        },
        expectedResponse: {
          status: 400,
          hasErrors: true
        }
      };

      try {
        const response = await request(app)
          .post('/api/projects')
          .send(testData.requestBody)
          .expect(400);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await projectTestRepository.save({
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

  describe('PUT /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a test project for update tests
      testProject = await createTestProject({
        name: 'Original Project Name',
        description: 'Original description',
        dueDate: new Date('2024-12-31'),
        members: ['user-1'],
        tasks: ['task-1']
      });
    });

    it('should update project successfully', async () => {
      const testData = {
        testName: 'Update Project Success',
        testDescription: 'Test updating project information with valid data and authentication',
        testType: 'integration',
        route: `/api/projects/${testProject.id}`,
        method: 'PUT',
        requestBody: {
          name: 'Updated Project Name',
          description: 'Updated description',
          members: ['user-1', 'user-2', 'user-3'],
          tasks: ['task-1', 'task-2', 'task-3']
        },
        expectedResponse: {
          status: 200,
          updatedName: 'Updated Project Name'
        }
      };

      try {
        const response = await request(app)
          .put(`/api/projects/${testProject.id}`)
          .send(testData.requestBody)
          .expect(200);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && response.body.name === testData.requestBody.name,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body.name).toBe(testData.requestBody.name);
        expect(response.body.description).toBe(testData.requestBody.description);
        expect(response.body.members).toEqual(testData.requestBody.members);
        expect(response.body.tasks).toEqual(testData.requestBody.tasks);
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail update with invalid project ID', async () => {
      const testData = {
        testName: 'Update Project Invalid ID',
        testDescription: 'Test updating project with non-existent ID to ensure proper error handling',
        testType: 'unit',
        route: '/api/projects/invalid-uuid',
        method: 'PUT',
        requestBody: {
          name: 'Updated Name'
        },
        expectedResponse: {
          status: 400,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .put('/api/projects/invalid-uuid')
          .send(testData.requestBody)
          .expect(400);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail update with non-existent project', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Update Non-existent Project',
        testDescription: 'Test updating a project that does not exist in the database',
        testType: 'unit',
        route: `/api/projects/${nonExistentId}`,
        method: 'PUT',
        requestBody: {
          name: 'Updated Name'
        },
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .put(`/api/projects/${nonExistentId}`)
          .send(testData.requestBody)
          .expect(404);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Project not found');
      } catch (error) {
        await projectTestRepository.save({
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

  describe('DELETE /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a test project for delete tests
      testProject = await createTestProject({
        name: 'Project to Delete',
        description: 'This project will be deleted',
        dueDate: new Date('2024-12-31'),
        members: ['user-1'],
        tasks: ['task-1']
      });
    });

    it('should delete project successfully', async () => {
      const testData = {
        testName: 'Delete Project Success',
        testDescription: 'Test deleting a project with valid ID and authentication',
        testType: 'integration',
        route: `/api/projects/${testProject.id}`,
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasProjectData: true
        }
      };

      try {
        const response = await request(app)
          .delete(`/api/projects/${testProject.id}`)
          .expect(200);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200,
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('dueDate');
        expect(response.body).toHaveProperty('members');
        expect(response.body).toHaveProperty('tasks');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
        expect(response.body.id).toBe(testProject.id);
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail delete with invalid project ID', async () => {
      const testData = {
        testName: 'Delete Project Invalid ID',
        testDescription: 'Test deleting project with invalid UUID format to ensure proper validation',
        testType: 'unit',
        route: '/api/projects/invalid-uuid',
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 400,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .delete('/api/projects/invalid-uuid')
          .expect(400);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 400,
          status: response.status === 400 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('errors');
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail delete with non-existent project', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Delete Non-existent Project',
        testDescription: 'Test deleting a project that does not exist in the database',
        testType: 'unit',
        route: `/api/projects/${nonExistentId}`,
        method: 'DELETE',
        requestBody: {},
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .delete(`/api/projects/${nonExistentId}`)
          .expect(404);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Project not found');
      } catch (error) {
        await projectTestRepository.save({
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

  describe('GET /api/projects/:id/members', () => {
    beforeEach(async () => {
      // Create a test project for member tests
      testProject = await createTestProject({
        name: 'Member Test Project',
        description: 'Project for testing member endpoints',
        dueDate: new Date('2024-12-31'),
        members: ['user-1', 'user-2', 'user-3'],
        tasks: ['task-1']
      });
    });

    it('should get project members successfully', async () => {
      const testData = {
        testName: 'Get Project Members Success',
        testDescription: 'Test retrieving project members with valid project ID',
        testType: 'integration',
        route: `/api/projects/${testProject.id}/members`,
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasMembers: true
        }
      };

      try {
        const response = await request(app)
          .get(`/api/projects/${testProject.id}/members`)
          .expect(200);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && Boolean(response.body.members),
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('members');
        expect(Array.isArray(response.body.members)).toBe(true);
        expect(response.body.members).toEqual(testProject.members);
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail with non-existent project', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Get Members Non-existent Project',
        testDescription: 'Test getting members for a project that does not exist',
        testType: 'unit',
        route: `/api/projects/${nonExistentId}/members`,
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .get(`/api/projects/${nonExistentId}/members`)
          .expect(404);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Project not found');
      } catch (error) {
        await projectTestRepository.save({
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

  describe('GET /api/projects/:id/tasks', () => {
    beforeEach(async () => {
      // Create a test project for task tests
      testProject = await createTestProject({
        name: 'Task Test Project',
        description: 'Project for testing task endpoints',
        dueDate: new Date('2024-12-31'),
        members: ['user-1'],
        tasks: ['task-1', 'task-2', 'task-3']
      });
    });

    it('should get project tasks successfully', async () => {
      const testData = {
        testName: 'Get Project Tasks Success',
        testDescription: 'Test retrieving project tasks with valid project ID',
        testType: 'integration',
        route: `/api/projects/${testProject.id}/tasks`,
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 200,
          hasTasks: true
        }
      };

      try {
        const response = await request(app)
          .get(`/api/projects/${testProject.id}/tasks`)
          .expect(200);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 200 && Boolean(response.body.tasks),
          status: response.status === 200 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('tasks');
        expect(Array.isArray(response.body.tasks)).toBe(true);
        expect(response.body.tasks).toEqual(testProject.tasks);
      } catch (error) {
        await projectTestRepository.save({
          ...testData,
          actualResponse: { error: error.message },
          isPassed: false,
          errorMessage: error.message,
          status: 'failed'
        });
        throw error;
      }
    });

    it('should fail with non-existent project', async () => {
      const nonExistentId = '12345678-1234-1234-1234-123456789012';
      const testData = {
        testName: 'Get Tasks Non-existent Project',
        testDescription: 'Test getting tasks for a project that does not exist',
        testType: 'unit',
        route: `/api/projects/${nonExistentId}/tasks`,
        method: 'GET',
        requestBody: {},
        expectedResponse: {
          status: 404,
          hasError: true
        }
      };

      try {
        const response = await request(app)
          .get(`/api/projects/${nonExistentId}/tasks`)
          .expect(404);

        await projectTestRepository.save({
          ...testData,
          actualResponse: response.body,
          isPassed: response.status === 404,
          status: response.status === 404 ? 'passed' : 'failed'
        });

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Project not found');
      } catch (error) {
        await projectTestRepository.save({
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
      const testResults = await projectTestRepository.find();
      const passedTests = testResults.filter(test => test.isPassed);
      const failedTests = testResults.filter(test => !test.isPassed);
      
      console.log(`\n=== Project Routes Test Summary ===`);
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