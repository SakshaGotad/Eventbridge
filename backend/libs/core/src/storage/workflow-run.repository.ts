import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class WorkflowRunRepository {

  constructor(private db: DatabaseService) {}

  async create(workflowName: string, payload: any) {

    const result = await this.db.query(
      `
      INSERT INTO workflow_runs (workflow_name, status, payload)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [workflowName, 'running', payload]
    );

    return result.rows[0];
  }

  async findById(runId: string) {
    const result = await this.db.query(
      `
      SELECT id, workflow_name AS "workflowName", status, payload, created_at, updated_at
      FROM workflow_runs
      WHERE id = $1
      LIMIT 1
      `,
      [runId]
    );
    return result.rows[0];
  }

  async markFailed(runId: string, stepId?: string) {

  await this.db.query(
    `
    UPDATE eventbridge_step_runs
    SET status = 'failed'
    WHERE workflow_run_id = $1 AND step_id = $2
    `,
    [runId, stepId]
  );

}
  async complete(runId: string) {

    await this.db.query(
      `
      UPDATE workflow_runs
      SET status = 'completed'
      WHERE id = $1
      `,
      [runId]
    );

  }

}