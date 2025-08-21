import { DataSource } from "typeorm";
import { User, UserTest } from "./entities/User";
import { Task, TaskTest } from "./entities/Task";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'changeit',
  database: process.env.DB_NAME || 'my_database',
  synchronize: false, // Turn off auto-sync for migrations
  logging: true,
  entities: [User, UserTest, Task, TaskTest], // Path to your entities
  subscribers: [],
  migrations: ["src/migrations/*.ts"], // Path to your migrations folder
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