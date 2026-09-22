import dotenv from 'dotenv';
import 'reflect-metadata';
dotenv.config({ path: '.env' });
import express, { type Express, type NextFunction } from 'express';
import logger, { stream } from './utils/logger.js';
import { AppDataSource } from './config/database.js';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { type Request, type Response } from 'express';
import { errorResponse } from './utils/response.js';
import { handleError } from './utils/errors.js';
import { json } from 'node:stream/consumers';

const app: Express = express();
const port = process.env.PORT || 6000;

const initialize = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');

    app.listen(port, () => {
      logger.info(`[server]: Server is running at http://localhost:${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Error starting server', error);
    process.exit(1);
  }
};

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream }));

const API_VERSION = '/api/v1';
app.use(API_VERSION, routes);

app.use((req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Cannot find ${req.originalUrl} on this server`));
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.stack || error.message);
  const errorDetails = handleError(error);

  res.status(errorDetails.statusCode).json(errorResponse(errorDetails.message, error));
});

initialize().catch((error) => {
  logger.error('Error starting server', error);
  process.exit(1);
});
