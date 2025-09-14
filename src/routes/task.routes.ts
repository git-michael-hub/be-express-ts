import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

/**
 * Utility function to handle validation errors
 */
const handleValidationErrors = (req: any, res: any, next: any) => {
  console.log('BODY____REQUEST;', req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
  next();
};


/**
 * @swagger
 * tags:
 *   - name: Task
 *     description: API for managing tasks
 */


/**
 * @swagger
 * /api/tasks/:
 *   get:
 *     tags:
 *       - Task
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get("/", authenticateToken, async (req, res) => {
  console.log('[GET] List of tasks');

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const tasks = await taskRepository.find();
    res.status(200).json(tasks);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/:
 *   post:
 *     tags:
 *       - Task
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 */
router.post(
  "/", 
  authenticateToken,
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("dueDate")
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO 8601 format"),
    body("priority").isIn(["low", "medium", "high"]).withMessage("Invalid priority value"),
    body("isCompleted").optional().isBoolean(),
    body("isArchive").optional().isBoolean(),
    handleValidationErrors,
  ],
  async (req, res) => {
    console.log('[POST] Add a task');
    
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const newTask = taskRepository.create(req.body as Task);
      const savedTask = await taskRepository.save(newTask);
      res.status(201).json(savedTask);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags:
 *       - Task
 *     summary: Update an existing task
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
router.put(
  "/:id",
  authenticateToken,
  [
    param("id").isUUID().withMessage("Invalid ID format"),
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO 8601 format"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority value"),
    body("isCompleted").optional().isBoolean(),
    body("isArchive").optional().isBoolean(),
    handleValidationErrors,
  ], 
  async (req, res): Promise<any> => {
    console.log('[PUT] Update a task');

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const taskId = String(req.params.id);

      // Find the task by ID
      const existingTask = await taskRepository.findOneBy({ id: taskId });

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update the task with new data
      const updatedTask = taskRepository.merge(existingTask, req.body);

      // Save the updated task
      const savedTask = await taskRepository.save(updatedTask);

      res.status(200).json(savedTask);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Task
 *     summary: Delete an existing task
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.delete(
  "/:id",
  authenticateToken,
  [param("id").isUUID().withMessage("Invalid ID format"), handleValidationErrors], 
  async (req, res): Promise<any> => {
    console.log('[DELETE] Delete a task');

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const taskId = String(req.params.id);

      // Find the task by ID
      const existingTask = await taskRepository.findOneBy({ id: taskId });

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Remove the task
      await taskRepository.remove(existingTask);

      res.status(200).json({
        ...existingTask,
        id: taskId
      });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);


export default router;
