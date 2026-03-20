export interface WorkflowStep {
  id: string;
  handler: (payload: any) => Promise<any>;
   retry?: number;
}

export interface WorkflowDefinition {
  name: string;
   trigger?: {
    event: string;
  };
  steps: WorkflowStep[];
}