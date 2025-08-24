import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entities/Project";
import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

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
 *   - name: Project
 *     description: API for managing projects
 */

/**
 * @swagger
 * /api/projects/:
 *   get:
 *     tags:
 *       - Project
 *     summary: Get all projects
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", async (req, res) => {
  console.log('[GET] List of projects');

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const projects = await projectRepository.find();
    res.status(200).json(projects);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/projects/{id}/members:
 *   get:
 *     tags:
 *       - Project
 *     summary: Get project members
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectMembersResponse'
 *       404:
 *         description: Project not found
 */
router.get("/:id/members", [
    param("id").isUUID().withMessage("Invalid ID format"),
    handleValidationErrors
  ], async (req, res) => {
    console.log('[GET] Get project members');
  
    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const projectId = String(req.params.id);
  
      const project = await projectRepository.findOneBy({ id: projectId });
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json({ members: project.members });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });
  
  /**
   * @swagger
   * /api/projects/{id}/tasks:
   *   get:
   *     tags:
   *       - Project
   *     summary: Get project tasks
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Project tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ProjectTasksResponse'
   *       404:
   *         description: Project not found
   */
  router.get("/:id/tasks", [
    param("id").isUUID().withMessage("Invalid ID format"),
    handleValidationErrors
  ], async (req, res) => {
    console.log('[GET] Get project tasks');
  
    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const projectId = String(req.params.id);
  
      const project = await projectRepository.findOneBy({ id: projectId });
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json({ tasks: project.tasks });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

/**
 * @swagger
 * /api/projects/:
 *   post:
 *     tags:
 *       - Project
 *     summary: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCreate'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 */
router.post(
  "/", 
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("description").optional().isString(),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO 8601 format"),
    body("members").optional().isArray().withMessage("Members must be an array"),
    body("members.*").optional().isString().withMessage("Each member must be a string"),
    body("tasks").optional().isArray().withMessage("Tasks must be an array"),
    body("tasks.*").optional().isString().withMessage("Each task must be a string"),
    handleValidationErrors,
  ],
  async (req, res) => {
    console.log('[POST] Add a project');
    
    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const newProject = projectRepository.create(req.body as Project);
      const savedProject = await projectRepository.save(newProject);
      res.status(201).json(savedProject);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags:
 *       - Project
 *     summary: Update an existing project
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
 *             $ref: '#/components/schemas/ProjectUpdate'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 */
router.put(
  "/:id",
  [
    param("id").isUUID().withMessage("Invalid ID format"),
    body("name").optional().isString(),
    body("description").optional().isString(),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be in ISO 8601 format"),
    body("members").optional().isArray().withMessage("Members must be an array"),
    body("members.*").optional().isString().withMessage("Each member must be a string"),
    body("tasks").optional().isArray().withMessage("Tasks must be an array"),
    body("tasks.*").optional().isString().withMessage("Each task must be a string"),
    handleValidationErrors,
  ], 
  async (req, res): Promise<any> => {
    console.log('[PUT] Update a project');

    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const projectId = String(req.params.id);

      // Find the project by ID
      const existingProject = await projectRepository.findOneBy({ id: projectId });

      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update the project with new data
      const updatedProject = projectRepository.merge(existingProject, req.body);

      // Save the updated project
      const savedProject = await projectRepository.save(updatedProject);

      res.status(200).json(savedProject);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Project
 *     summary: Delete an existing project
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Invalid ID format"), handleValidationErrors], 
  async (req, res): Promise<any> => {
    console.log('[DELETE] Delete a project');

    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const projectId = String(req.params.id);

      // Find the project by ID
      const existingProject = await projectRepository.findOneBy({ id: projectId });

      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Remove the project
      await projectRepository.remove(existingProject);

      res.status(200).json({
        ...existingProject,
        id: projectId
      });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);


export default router;
