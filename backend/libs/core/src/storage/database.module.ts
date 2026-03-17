import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { WorkflowRunRepository } from './workflow-run.repository';
import { StepRunRepository } from './step-run.repository';

@Module({
  providers: [DatabaseService, WorkflowRunRepository, StepRunRepository],
  exports: [DatabaseService, WorkflowRunRepository, StepRunRepository],
})
export class DatabaseModule { }
