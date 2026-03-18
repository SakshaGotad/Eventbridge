import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '../common/workflow.interface';
import { StepRunRepository } from '../storage/step-run.repository';

@Injectable()
export class ExecutorService {
  constructor(
    private stepRunRepository: StepRunRepository
  ) {}

    async runWorkflow(
    workflow: WorkflowDefinition,
    payload: any,
    runId: string
  ): Promise<void> {

    console.log(`Starting workflow: ${workflow.name}`);

    for (const step of workflow.steps) {

      console.log(`Running step: ${step.id}`);

      // 1️⃣ Create step run
      await this.stepRunRepository.create(runId, step.id);

      try {
        // 2️⃣ Execute step
        await step.handler(payload);

        // 3️⃣ Mark complete
        await this.stepRunRepository.complete(runId, step.id);

      } catch (error) {

        console.error(`Step failed: ${step.id}`, error);

        // (for now just throw, later retry logic)
        throw error;
      }

    }

    console.log(`Workflow ${workflow.name} completed`);
  }

}
