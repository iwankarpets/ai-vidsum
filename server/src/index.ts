import 'reflect-metadata';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express, { type Express, type NextFunction } from 'express';
import logger, { stream } from './utils/logger.js';
import { AppDataSource } from './config/database.js';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { type Request, type Response } from 'express';
import { errorResponse } from './utils/response.js';
import { handleError } from './utils/errors.js';
import { JobsService } from './services/jobs.service.js';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { type RequestHandler } from 'express';

const app: Express = express();
const port = process.env.PORT || 5000;
const adminPort = process.env.ADMIN_PORT || 5001;

const initialize = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');

    JobsService.initialize();
    await JobsService.setupQueueHandlers();
    logger.info('Jobs service initialized');

    const adminApp: Express = express();
    const serverAdapter = new ExpressAdapter();

    createBullBoard({
      queues: [new BullAdapter(JobsService.getTranscriptionQueue())],
      serverAdapter,
    });

    adminApp.use(cors());
    serverAdapter.setBasePath('/admin/queues');

    adminApp.use('/admin/queues', serverAdapter.getRouter() as RequestHandler);
    adminApp.listen(adminPort, () => {
      logger.info(`[admin]: Admin server is running at http://localhost:${adminPort}`);
    });

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
  res
    .status(404)
    .json(errorResponse(`Cannot find ${req.originalUrl} on this server`, 'ROUTE_NOT_FOUND'));
});

app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(error.stack || error.message);
  const errorDetails = handleError(error);

  res
    .status(errorDetails.statusCode)
    .json(errorResponse(errorDetails.message, errorDetails.code, error));
});

initialize().catch((error) => {
  logger.error('Error starting server', error);
  process.exit(1);
});
