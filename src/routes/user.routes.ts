import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest, authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const authService = new AuthService();

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
 *   - name: User
 *     description: API for managing users
 */


/**
 * @swagger
 * /api/users/:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", authenticateToken, async (req, res) => {
  console.log('[GET] List of users');

  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.status(200).json(users);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user details
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  [
    body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either "admin" or "user"'),
    body('position').optional().isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
    body('team').optional().isArray().withMessage('Team must be an array'),
    body('team.*').optional().isLength({ min: 1, max: 100 }).withMessage('Each team name must be between 1 and 100 characters'),
    handleValidationErrors
  ], 
  async (req, res) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLoginResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    console.log('login:result', result)
    res.json(result);
  } catch (error) {
    console.log('login:error', error)
    res.status(401).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags:
 *       - User
 *     summary: Log out a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLogoutResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // In a stateless JWT setup, the client simply discards the token
    // You could implement token blacklisting here if needed
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update an existing user
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
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
    body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either "admin" or "user"'),
    body('position').optional().isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
    body('team').optional().isArray().withMessage('Team must be an array'),
    body('team.*').optional().isLength({ min: 1, max: 100 }).withMessage('Each team name must be between 1 and 100 characters'),
    handleValidationErrors
  ], 
  async (req, res): Promise<any> => {
    console.log('[PUT] Update a user');

    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = String(req.params.id);

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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete an existing user
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.delete(
  "/:id",
  authenticateToken,
  [param("id").isUUID().withMessage("Invalid ID format"), handleValidationErrors], 
  async (req, res): Promise<any> => {
    console.log('[DELETE] Delete a task');

    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = String(req.params.id);

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


/**
 * @swagger
 * /api/users/verify-email/{token}:
 *   get:
 *     tags:
 *       - User
 *     summary: Verify user email
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/check-token:
 *   post:
 *     tags:
 *       - User
 *     summary: Check if JWT token is still valid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token validity information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                 timeRemaining:
 *                   type: number
 *                   description: Time remaining in milliseconds
 *       401:
 *         description: Invalid token
 */
router.get("/check-token", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const result = await authService.checkTokenValidity(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/reset-token:
 *   post:
 *     tags:
 *       - User
 *     summary: Reset JWT token if it expires within 1 hour
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token reset information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newToken:
 *                   type: string
 *                   description: New JWT token (only if token was reset)
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid token
 */
router.post("/reset-token", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const result = await authService.resetTokenIfActive(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});


export default router;
