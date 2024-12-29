import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Request, Response } from "express";

const router = Router();

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

router.get("/", async (req, res) => {
  const taskRepository = AppDataSource.getRepository(Task);
  const tasks = await taskRepository.find();
  res.json(tasks);
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
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.post("/", async (req, res) => {
  const taskRepository = AppDataSource.getRepository(Task);
  const newTask = taskRepository.create(req.body);
  const savedTask = await taskRepository.save(newTask);
  res.status(201).json(savedTask);
});

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
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.put("/:id", async (req, res): Promise<any> => {
  const taskRepository = AppDataSource.getRepository(Task);
  const taskId = String(req.params.id);

  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

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
 *       404:
 *         description: Task not found
 */
router.delete("/:id", async (req, res): Promise<any> => {
  const taskRepository = AppDataSource.getRepository(Task);
  const taskId = String(req.params.id);

  try {
    // Find the task by ID
    const existingTask = await taskRepository.findOneBy({ id: taskId });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove the task
    await taskRepository.remove(existingTask);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});


export default router;
