import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Request, Response } from "express";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find();
  res.json(users);
});

// Create a new user
router.post("/", async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);
  const newUser = userRepository.create(req.body);
  const savedUser = await userRepository.save(newUser);
  res.status(201).json(savedUser);
});

// Update an existing user
router.put("/:id", async (req, res): Promise<any> => {
  const userRepository = AppDataSource.getRepository(User);
  const userId = Number(req.params.id);

  try {
    // Find the user by ID
    const existingUser = await userRepository.findOneBy({ id: userId });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user with new data
    const updatedUser = userRepository.merge(existingUser, req.body);

    // Save the updated user
    const savedUser = await userRepository.save(updatedUser);

    res.status(200).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete an existing user
router.delete("/:id", async (req, res): Promise<any> => {
  const userRepository = AppDataSource.getRepository(User);
  const userId = Number(req.params.id);

  try {
    // Find the user by ID
    const existingUser = await userRepository.findOneBy({ id: userId });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the user
    await userRepository.remove(existingUser);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});


export default router;
