export interface WorkflowStep {
  delay: number;
  id: string;
  handler: (payload: any) => Promise<any>;
    retry?: {
    attempts: number;
    backoff: number; // base delay in ms
  };
}

export interface WorkflowDefinition {
  name: string;
   trigger?: {
    event: string;
  };
  steps: WorkflowStep[];
}