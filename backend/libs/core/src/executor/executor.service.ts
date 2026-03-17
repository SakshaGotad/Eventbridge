import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '../common/workflow.interface';

@Injectable()
export class ExecutorService {
     async runWorkflow(workflow: WorkflowDefinition, payload: any): Promise<void> {

    console.log(`Starting workflow: ${workflow.name}`);

    for (const step of workflow.steps) {

      console.log(`Running step: ${step.id}`);

      await step.handler(payload);

    }

    console.log(`Workflow ${workflow.name} completed`);

  }
}
