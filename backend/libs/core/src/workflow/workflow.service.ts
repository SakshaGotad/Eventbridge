import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '../common/workflow.interface';

@Injectable()
export class WorkflowService {
 private workflows = new Map<string, WorkflowDefinition>();

  registerWorkflow(workflow: WorkflowDefinition) {
    this.workflows.set(workflow.name, workflow);
  }

  getWorkflow(name: string): WorkflowDefinition | undefined {
    return this.workflows.get(name);
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  getWorkflowsByEvent(event: string): WorkflowDefinition[] {
  return Array.from(this.workflows.values()).filter(
    (wf) => wf.trigger?.event === event
  );
}

getStepIndex(workflowName: string, stepId: string): number {
  const workflow = this.getWorkflow(workflowName);

  if (!workflow) {
    throw new Error(`Workflow ${workflowName} not found`);
  }

  const index = workflow.steps.findIndex(
    (step) => step.id === stepId
  );

  if (index === -1) {
    throw new Error(`Step ${stepId} not found`);
  }

  return index;
}
}
