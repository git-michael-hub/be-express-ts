// src/seed.ts
import { AppDataSource } from "./../data-source";
import { Task } from "./../entities/Task";
import fs from "fs";
import path from "path";

// Load tasks from a JSON file
const loadTasksFromJSON = (): any[] => {
  const filePath = path.join(__dirname, "./../mock-data/5000_lorem_tasks.json");
//   debugger;
  const fileData = fs.readFileSync(filePath, "utf-8");
  // console.log('TEST:filePath:', filePath);
  // console.log('TEST:fileData:', fileData);
  return JSON.parse(fileData);
};

const seedData = async () => {
  const connection = await AppDataSource.initialize();
  
  // Create some tasks
  const tasks: Task[] = loadTasksFromJSON();

  for (let taskData of tasks) {
    const task = new Task();
    // debugger;
    console.log('TEST:task:', taskData);

    task.title = taskData.title;
    task.description = taskData.description;
    task.date = taskData.date;
    task.priority = taskData.priority;
    task.isCompleted = taskData.isCompleted;
    task.isArchive = taskData.isArchive;
    
    await connection.manager.save(task);
  }

  console.log("Seeder executed: Data inserted into Users table.");
  await connection.destroy();
};

seedData().catch((error) => console.log(error));

// NOTE: requires migration before to execute

// npx ts-node src/seeder/task.seed.ts