export interface WorkflowStep {
  delay: any;
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