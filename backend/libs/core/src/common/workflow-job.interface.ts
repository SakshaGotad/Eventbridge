export interface WorkflowJobData {
  workflowName: string;
  runId: string;
  payload: any;
  stepIndex?: number; // ✅ optional for backward compatibility
}