import { AppDataSource } from "./data-source";

export const connectDB = async () => {
  console.log('connectDB connectDB connectDB')
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");
  }
  catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
