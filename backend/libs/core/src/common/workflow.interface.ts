export interface WorkflowStep {
  id: string;
  handler: (payload: any) => Promise<any>;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}