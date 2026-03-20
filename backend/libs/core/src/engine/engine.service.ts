import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';
import { ExecutorService } from '../executor/executor.service';
import { WorkflowRunRepository } from '../storage/workflow-run.repository';
import { QueueService } from '../queue/queue.service';
@Injectable()
export class EngineService {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executorService: ExecutorService,
    private readonly workflowRunRepository: WorkflowRunRepository,
    private readonly queueService: QueueService
  ) { }

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

      await this.workflowRunRepository.markFailed(run.id);

      throw new InternalServerErrorException(
        `Workflow ${name} execution failed`,
      );
    }
  }

  async emitEvent(name: string, payload: any) {
    // ✅ Validate input
    if (!name) {
      throw new BadRequestException('Event name is required');
    }

    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Payload must be a valid object');
    }

    const workflows = this.workflowService.getWorkflowsByEvent(name);

    // ✅ Proper error instead of message
    if (!workflows.length) {
      throw new NotFoundException(
        `No workflows found for event: ${name}`
      );
    }

    for (const wf of workflows) {
      const run = await this.workflowRunRepository.create(wf.name, payload);
      await this.queueService.addWorkflowJob({
        workflowName: wf.name,
        payload,
        stepIndex: 0,
        runId: run.id,
      });
    }

    return {
      success: true,
      message: 'Event processed successfully',
      triggeredWorkflows: workflows.map((w) => w.name),
    };
  }
}
