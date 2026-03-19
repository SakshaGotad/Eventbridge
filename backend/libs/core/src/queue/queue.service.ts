import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
@Injectable()
export class QueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('eventbridge-workflow', {
      connection: {
        url: process.env.REDIS_URL!,
      },
    });

  }
  async addWorkflowJob(data: any) {
    await this.queue.add('run-workflow', data);
  }
}

