import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Request, Response } from "express";

const router = Router();

// Get all tasks
router.get("/", async (req, res) => {
  const taskRepository = AppDataSource.getRepository(Task);
  const tasks = await taskRepository.find();
  res.json(tasks);
});

// Create a new task
router.post("/", async (req, res) => {
  const taskRepository = AppDataSource.getRepository(Task);
  const newTask = taskRepository.create(req.body);
  const savedTask = await taskRepository.save(newTask);
  res.status(201).json(savedTask);
});

// Update an existing task
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

// Delete an existing task
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
