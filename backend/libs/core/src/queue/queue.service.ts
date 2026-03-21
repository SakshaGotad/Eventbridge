import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { WorkflowJobData } from '../common/workflow-job.interface';
@Injectable()
export class QueueService {
  private queue: Queue;

  constructor() {
     if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is not defined');
    }

    this.queue = new Queue('eventbridge-workflow', {
      connection: {
        url: process.env.REDIS_URL!,
      },
    });

  }
   async addWorkflowJob(
    data: WorkflowJobData,
    options?: { delay?: number },
  ) {
    return this.queue.add('run-workflow', data, options);
  }
}

