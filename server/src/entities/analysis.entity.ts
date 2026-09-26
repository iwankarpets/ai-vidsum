import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Video } from './video.entity.js';

export type Sentiment = 'positive' | 'negative' | 'neutral';

@Entity()
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare summary: string;

  @Column({ type: 'text', array: true })
  declare keyPoints: string[];

  @Column({
    type: 'enum',
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  })
  declare sentiment: Sentiment;

  @Column({ type: 'text', array: true })
  declare suggestedTags: string[];

  @OneToOne(() => Video, (video) => video.analysis)
  @JoinColumn()
  declare video: Video;
}
