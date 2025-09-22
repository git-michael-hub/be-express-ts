import { DataSource } from "typeorm";
import { User, UserTest } from "./entities/User";
import { Task, TaskTest } from "./entities/Task";
import { Project, ProjectTest } from "./entities/Project";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Turn off auto-sync for migrations
  logging: true,
  entities: [
    User, UserTest, 
    Task, TaskTest,
    Project, ProjectTest
  ], // Path to your entities
  subscribers: [],
  // Disable migrations in test environment to avoid syntax errors
  migrations: process.env.NODE_ENV === 'test' ? [] : ["src/migrations/*.ts"],
});

console.log(AppDataSource.options);
console.log(AppDataSource.options.entities);

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source initialized");
    // const users = await AppDataSource.getRepository(User).find();
    // console.log("Users:", users);
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
  