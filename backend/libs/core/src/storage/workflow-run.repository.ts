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