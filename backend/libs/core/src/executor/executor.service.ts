import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '../common/workflow.interface';
import { StepRunRepository } from '../storage/step-run.repository';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ExecutorService {
  constructor(
    private stepRunRepository: StepRunRepository,
    private queueService: QueueService,
  ) {}

  async runWorkflow(
    workflow: WorkflowDefinition,
    payload: any,
    runId: string,
    stepIndex: number = 0,
  ): Promise<void> {
    console.log(`Starting workflow: ${workflow.name}`);
    const MAX_RETRIES = 3;
    for (let i = stepIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      if (step.delay) {
        console.log(`Delaying workflow for ${step.delay} ms`);

        await this.queueService.addWorkflowJob(
          {
            workflowName: workflow.name,
            payload,
            runId,
            stepIndex: i + 1, // resume next step
          },
          {
            delay: step.delay,
          },
        );

        return; 
      }

      console.log(`Running step: ${step.id}`);

      await this.stepRunRepository.create(runId, step.id);

      const maxAttempts = step.retry?.attempts || 3;
      const baseDelay = step.retry?.backoff || 1000;

      let success = false;
      let attempts = 0;

      while (!success && attempts < maxAttempts) {
        try {
          attempts++;

          await this.stepRunRepository.incrementAttempts(runId, step.id);

          await step.handler(payload);

          await this.stepRunRepository.complete(runId, step.id);

          success = true;
        } catch (error) {
          console.error(`Step failed: ${step.id}`, error);

          if (attempts >= maxAttempts) {
            await this.stepRunRepository.markFailed(runId, step.id);

            throw new Error(
              `Step ${step.id} failed after ${maxAttempts} attempts`,
            );
          }

          // 🔥 BACKOFF (IMPORTANT)
          const delay = baseDelay * Math.pow(2, attempts);

          console.log(
            `Retrying step ${step.id} in ${delay} ms (attempt ${attempts})`,
          );

          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    console.log(`Workflow ${workflow.name} completed`);
  }
}
