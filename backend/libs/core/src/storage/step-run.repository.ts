import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class StepRunRepository {
  constructor(private db: DatabaseService) {}

  async create(runId: string, stepId: string) {
    await this.db.query(
      `
      INSERT INTO step_runs (workflow_run_id, step_id, status, attempts)
      VALUES ($1, $2, $3)
      `,
      [runId, stepId, 'running', 0],
    ); 
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
    SET status = 'failed'
    WHERE workflow_run_id = $1 AND step_id = $2
    `,
      [runId, stepId],
    );
  }
  async complete(runId: string, stepId: string) {
    await this.db.query(
      `
      UPDATE step_runs
      SET status = 'completed'
      WHERE workflow_run_id = $1 AND step_id = $2
      `,
      [runId, stepId],
    );
  }
}
