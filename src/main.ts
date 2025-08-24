import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import http from 'http';
import webrtcConnect  from './webrtc/connection';
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import projectRoutes from "./routes/project.routes";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "./config/swagger";

const SPECS = swaggerJsdoc(swaggerConfig);



dotenv.config();

// Basic HTTP server with Express only
export const APP = express();

APP.use(express.json());

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

APP.use(
    cors({
        origin: 'http://localhost:4200', // Allow only this origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'],       // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    })
);


/**
 * Create an HTTP
 * WebSocket (e.g., Socket.IO) support
 * Combining Express with HTTPS
 * Custom server-level logic
 */
const SERVER = http.createServer(APP);

// webrtc connection
webrtcConnect(
    SERVER,
    {
        cors: {
        origin: "http://localhost:4200", // Allow your frontend's origin
        methods: ["GET", "POST"]
        }
    }
);


APP.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express.js edited ni try!');
});
  

// Middleware
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SPECS));

// Routes
APP.use("/api/users", userRoutes);
APP.use("/api/tasks", taskRoutes);
APP.use("/api/projects", projectRoutes);

//  '0.0.0.0'
SERVER.listen(PORT, () => {
    // console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});