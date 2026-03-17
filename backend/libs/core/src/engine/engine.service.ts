import { Injectable } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';
import { ExecutorService } from '../executor/executor.service';
import { WorkflowRunRepository } from '../storage/workflow-run.repository';
@Injectable()
export class EngineService {

    constructor(
        private readonly workflowService: WorkflowService,
        private readonly executorService: ExecutorService,
    private readonly workflowRunRepository: WorkflowRunRepository,
    ) { }

    async startWorkflow(name: string, payload: any): Promise<void> {

        const workflow = this.workflowService.getWorkflow(name);

        if (!workflow) {
            throw new Error(`Workflow ${name} not found`);
        }

        const run = await this.workflowRunRepository.create(name, payload);

        await this.executorService.runWorkflow(workflow, payload);

        await this.workflowRunRepository.complete(run.id);
    }
}
