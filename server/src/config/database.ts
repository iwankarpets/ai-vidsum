import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Video } from '../entities/video.entity.js';
import { Transcription } from '../entities/transcription.enity.js';
import { Analysis } from '../entities/analysis.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'video_summarizer',
  logging: ['query', 'error'],
  entities: [User, Video, Transcription, Analysis],
  migrations: [],
  subscribers: [],
  synchronize: true,
});
