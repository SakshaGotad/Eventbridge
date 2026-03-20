import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '../common/workflow.interface';
import { StepRunRepository } from '../storage/step-run.repository';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ExecutorService {
  constructor(
    private stepRunRepository: StepRunRepository,
    private queueService: QueueService
  ) { }

  async runWorkflow(
    workflow: WorkflowDefinition,
    payload: any,
    runId: string,
    stepIndex: number = 0
  ): Promise<void> {

    console.log(`Starting workflow: ${workflow.name}`);
    const MAX_RETRIES = 3;
    for (let i = stepIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];

      console.log(`Running step: ${step.id}`);
      if (step.delay) {
        await this.queueService.addWorkflowJob(
          {
            workflowName: workflow.name,
            payload,
            runId,
            stepIndex: i + 1, // resume next step
          },
          {
            delay: (step as any).delay,
          },
        );

        return; // ⛔ STOP execution here
      }
      // 1️⃣ Create step run
      await this.stepRunRepository.create(runId, step.id);

      let success = false;
      let attempts = 0;

      while (!success && attempts < MAX_RETRIES) {
        try {
          // 2️⃣ Execute step
          attempts++;

          await this.stepRunRepository.incrementAttempts(runId, step.id);

          await step.handler(payload);

          // 3️⃣ Mark complete
          await this.stepRunRepository.complete(runId, step.id);

          success = true;

        } catch (error) {

          console.error(`Step failed: ${step.id}`, error);
          if (attempts >= MAX_RETRIES) {

            await this.stepRunRepository.markFailed(runId, step.id);

            throw new Error(`Step ${step.id} failed after ${MAX_RETRIES} attempts`);

          }
        }

      }
    }

    console.log(`Workflow ${workflow.name} completed`);
  }

}
