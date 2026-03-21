import { Worker } from 'bullmq';
import { ExecutorService } from '../executor/executor.service';
import { WorkflowService } from '../workflow/workflow.service';
import { WorkflowRunRepository } from '../storage/workflow-run.repository';
import { NotFoundException } from '@nestjs/common';

export function createWorker(
  executor: ExecutorService,
  workflowService: WorkflowService,
  workflowRunRepo: WorkflowRunRepository,
) {

  const worker = new Worker(
    'eventbridge-workflow',
    async (job) => {

      const { workflowName, payload, runId, stepIndex=0 } = job.data;

      console.log('Worker received job:', workflowName);

      const workflow = workflowService.getWorkflow(workflowName);

      if (!workflow) {
        throw new NotFoundException(`Workflow ${workflowName} not found`);
      }

      try {
        await executor.runWorkflow(workflow, payload, runId, stepIndex);

        // await workflowRunRepo.complete(runId);

      } catch (error) {

        console.error('Worker execution failed:', error);

        await workflowRunRepo.markFailed(runId);

        throw error;
      } 

    },
    {
      connection: {
        url: process.env.REDIS_URL!,
      },
    }
  );

  return worker;
}