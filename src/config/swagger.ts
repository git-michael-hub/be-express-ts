import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
      description: "A simple Express API documented with Swagger",
    },
    tags: [
        { name: "User", description: "Operations related to users" },
        { name: "Task", description: "Operations related to tasks" },
    ],
    servers: [
      {
        url: "http://localhost:3000", // Replace with your server URL
        // url: "http://52.87.196.43:80", // Replace with your server URL
      },
    ],
    components: {
        schemas: {
            Task: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid", example: "2a1c6c6a-4bd4-4d5a-8a5e-0f5f0b3b9d3a" },
                title: { type: "string", example: "Complete the project" },
                description: { type: "string", nullable: true, example: "Detailed task description" },
                dueDate: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                priority: { type: "string", enum: ["low", "medium", "high"], example: "high" },
                status: { type: "string", enum: ["todo", "inprogress", "done", "block", "inreview"], example: "todo" },
                isArchive: { type: "boolean", example: false },
                createdAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                updatedAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" }
              }
            },
            TaskCreate: {
              type: "object",
              required: ["title", "dueDate", "priority"],
              properties: {
                title: { type: "string", example: "Complete the project" },
                description: { type: "string", nullable: true, example: "Detailed task description" },
                dueDate: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                priority: { type: "string", enum: ["low", "medium", "high"], example: "high" },
                isCompleted: { type: "boolean", example: false },
                isArchive: { type: "boolean", example: false }
              }
            },
            TaskUpdate: {
              type: "object",
              properties: {
                title: { type: "string", example: "Update docs" },
                description: { type: "string", nullable: true, example: "Refine description" },
                dueDate: { type: "string", format: "date-time", example: "2025-01-10T10:00:00.000Z" },
                priority: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
                isCompleted: { type: "boolean", example: true },
                isArchive: { type: "boolean", example: false }
              }
            },
            User: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid", example: "2a1c6c6a-4bd4-4d5a-8a5e-0f5f0b3b9d3a" },
                name: { type: "string", example: "John Doe" },
                email: { type: "string", format: "email", example: "john.doe@example.com" },
                password: { type: "string", example: "hashedPassword123" },
                isEmailVerified: { type: "boolean", example: false },
                lastLoginAt: { type: "string", format: "date-time", nullable: true, example: "2024-12-25T14:48:00.000Z" },
                role: { type: "string", enum: ["admin", "user"], example: "user" },
                position: { type: "array", items: { type: "string" }, example: ["Software Engineer", "Team Lead"] },
                team: { type: "array", items: { type: "string" }, example: ["Frontend", "Backend"] },
                createdAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                updatedAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" }
              }
            },
            UserCreate: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "John Doe" },
                email: { type: "string", format: "email", example: "john.doe@example.com" },
                password: { type: "string", example: "SecurePass123!" },
                role: { type: "string", enum: ["admin", "user"], example: "user" },
                position: { type: "array", items: { type: "string" }, example: ["Software Engineer"] },
                team: { type: "array", items: { type: "string" }, example: ["Frontend"] }
              }
            },
            UserUpdate: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Doe Updated" },
                email: { type: "string", format: "email", example: "john.updated@example.com" },
                password: { type: "string", example: "NewSecurePass123!" },
                role: { type: "string", enum: ["admin", "user"], example: "admin" },
                position: { type: "array", items: { type: "string" }, example: ["Senior Engineer"] },
                team: { type: "array", items: { type: "string" }, example: ["Frontend", "Backend"] }
              }
            },
            UserLogin: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { 
                  type: "string", 
                  format: "email", 
                  example: "john.doe@example.com",
                  description: "User's email address"
                },
                password: { 
                  type: "string", 
                  example: "SecurePass123!",
                  description: "User's password"
                }
              }
            },
            UserLoginResponse: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User"
                },
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  description: "JWT access token"
                }
              }
            },
            UserLogoutResponse: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Logged out successfully",
                  description: "Logout confirmation message"
                }
              }
            },
            Project: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid", example: "2a1c6c6a-4bd4-4d5a-8a5e-0f5f0b3b9d3a" },
                name: { type: "string", example: "E-commerce Platform" },
                description: { type: "string", nullable: true, example: "Build a modern e-commerce platform with React and Node.js" },
                dueDate: { type: "string", format: "date-time", nullable: true, example: "2024-12-31T23:59:59.000Z" },
                members: { type: "array", items: { type: "string" }, example: ["user-id-1", "user-id-2", "user-id-3"] },
                tasks: { type: "array", items: { type: "string" }, example: ["task-id-1", "task-id-2"] },
                createdAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                updatedAt: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" }
              }
            },
            ProjectCreate: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "E-commerce Platform" },
                description: { type: "string", nullable: true, example: "Build a modern e-commerce platform" },
                dueDate: { type: "string", format: "date-time", nullable: true, example: "2024-12-31T23:59:59.000Z" },
                members: { type: "array", items: { type: "string" }, example: ["user-id-1", "user-id-2"] },
                tasks: { type: "array", items: { type: "string" }, example: ["task-id-1"] }
              }
            },
            ProjectUpdate: {
              type: "object",
              properties: {
                name: { type: "string", example: "Updated E-commerce Platform" },
                description: { type: "string", nullable: true, example: "Updated project description" },
                dueDate: { type: "string", format: "date-time", nullable: true, example: "2025-01-15T23:59:59.000Z" },
                members: { type: "array", items: { type: "string" }, example: ["user-id-1", "user-id-2", "user-id-4"] },
                tasks: { type: "array", items: { type: "string" }, example: ["task-id-1", "task-id-2", "task-id-3"] }
              }
            },
            ProjectMembersResponse: {
              type: "object",
              properties: {
                members: {
                  type: "array",
                  items: { type: "string" },
                  example: ["user-id-1", "user-id-2", "user-id-3"],
                  description: "Array of user IDs who are members of the project"
                }
              }
            },
            ProjectTasksResponse: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: { type: "string" },
                  example: ["task-id-1", "task-id-2"],
                  description: "Array of task IDs belonging to the project"
                }
              }
            },
        }
    }
  },
  apis: ["./src/routes/*.ts"], // Path to API routes for documentation
};

export default swaggerOptions;
