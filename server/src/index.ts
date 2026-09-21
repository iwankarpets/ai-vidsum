import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import express, { type Express } from 'express';
import logger, { stream } from './utils/logger.js';
import { AppDataSource } from './config/database.js';
import cors from 'cors';
import morgan from 'morgan';



const app: Express = express();
const port = process.env.PORT || 6000;

const initialize = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");


    app.listen(port, () => {
     logger.info(`[server]: Server is running at http://localhost:${port}`);
     logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Error starting server', error);
    process.exit(1);
  }
};

app.use(cors())
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined", { stream }))


initialize().catch((error) => {
  logger.error('Error starting server', error);
  process.exit(1);
});
