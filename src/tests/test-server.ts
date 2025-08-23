import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/user.routes';
import taskRoutes from '../routes/task.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '../config/swagger';

const servers: { [key: number]: any } = {};
const apps: { [key: number]: express.Application } = {};

export const createTestServer = (port: number) => {
  if (servers[port] && apps[port]) {
    return { app: apps[port], server: servers[port] };
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));

  // Start server
  const server = app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
  });

  servers[port] = server;
  apps[port] = app;

  return { app, server };
};

export const closeTestServer = async (port: number) => {
  if (servers[port]) {
    await new Promise((resolve) => servers[port].close(resolve));
    delete servers[port];
    delete apps[port];
  }
};

export const closeAllTestServers = async () => {
  const ports = Object.keys(servers).map(Number);
  for (const port of ports) {
    await closeTestServer(port);
  }
};