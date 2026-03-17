import { Injectable } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';
import { ExecutorService } from '../executor/executor.service';

@Injectable()
export class EngineService {

    constructor(
    private readonly workflowService: WorkflowService,
    private readonly executorService: ExecutorService,
  ) {}

  async startWorkflow(name: string, payload: any): Promise<void> {

    const workflow = this.workflowService.getWorkflow(name);

    if (!workflow) {
      throw new Error(`Workflow ${name} not found`);
    }

    await this.executorService.runWorkflow(workflow, payload);

  }
}
