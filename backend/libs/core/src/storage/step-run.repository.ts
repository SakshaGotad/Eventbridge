import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class StepRunRepository {
  constructor(private db: DatabaseService) {}

  async create(runId: string, stepId: string) {
    await this.db.query(
      `
      INSERT INTO eventbridge_step_runs (workflow_run_id, step_id, status, attempts)
      VALUES ($1, $2, $3)
      `,
      [runId, stepId, 'running', 0],
    ); 
  }

  async getStepsByRunId(runId: string) {
  const result = await this.db.query(
    `
    SELECT step_id, status, attempts, updated_at
    FROM eventbridge_step_runs
    WHERE workflow_run_id = $1
    ORDER BY updated_at ASC
    `,
    [runId],
  );

  return result.rows;
}
  async incrementAttempts(runId: string, stepId: string) {
    await this.db.query(
      `
    UPDATE eventbridge_step_runs
    SET attempts = attempts + 1
    WHERE workflow_run_id = $1 AND step_id = $2
    `,
      [runId, stepId],
    );
  }

  async markFailed(runId: string, stepId: string) {
    await this.db.query(
      `
    UPDATE eventbridge_step_runs
    SET status = 'failed', updated_at= NOW()
    WHERE workflow_run_id = $1 AND step_id = $2
    `,
      [runId, stepId],
    );
  }
  async complete(runId: string, stepId: string) {
    await this.db.query(
      `
      UPDATE eventbridge_step_runs
      SET status = 'completed', updated_at = NOW()
      WHERE workflow_run_id = $1 AND step_id = $2
      `,
      [runId, stepId],
    );
  }

  async getFailedStep(runId: string) {
  const result = await this.db.query(
    `
    SELECT step_id
    FROM eventbridge_step_runs
    WHERE workflow_run_id = $1
      AND status = 'failed'
    ORDER BY updated_at DESC
    LIMIT 1
    `,
    [runId],
  );

  return result.rows[0] || null;
}
}
