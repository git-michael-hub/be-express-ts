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
      },
    ],
    components: {
        schemas: {
            Task: {
                type: "object",
                properties: {
                  id: { type: "string", example: "101" },
                  title: { type: "string", example: "Complete the project" },
                  description: { type: "string", example: "Detailed task description" },
                  date: { type: "string", format: "date-time", example: "2024-12-25T14:48:00.000Z" },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    example: "high",
                  },
                  isCompleted: { type: "boolean", example: false },
                  isArchive: { type: "boolean", example: false },
                },
            }
        }
    }
  },
  apis: ["./src/routes/*.ts"], // Path to API routes for documentation
};

export default swaggerOptions;
