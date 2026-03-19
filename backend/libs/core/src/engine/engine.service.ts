import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';
import { ExecutorService } from '../executor/executor.service';
import { WorkflowRunRepository } from '../storage/workflow-run.repository';
@Injectable()
export class EngineService {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executorService: ExecutorService,
    private readonly workflowRunRepository: WorkflowRunRepository,
  ) {}

  async startWorkflow(name: string, payload: any): Promise<void> {
    const workflow = this.workflowService.getWorkflow(name);
    if (!workflow) { 
      throw new NotFoundException(`Workflow ${name} not found`);
    }
    
    const run = await this.workflowRunRepository.create(name, payload);

    try {
      await this.executorService.runWorkflow(workflow, payload, run.id);

      await this.workflowRunRepository.complete(run.id);
    } catch (error) {
      console.error('Workflow failed:', error);

      await this.workflowRunRepository.markFailed(run.id,);

      throw new InternalServerErrorException(
        `Workflow ${name} execution failed`,
      );
    }
    await this.executorService.runWorkflow(workflow, payload, run.id);

    await this.workflowRunRepository.complete(run.id);
  }
}
