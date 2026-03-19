import { Module, OnModuleInit } from '@nestjs/common';
import { CoreService } from './eventbridge.service';
import { EngineModule } from './engine/engine.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExecutorModule } from './executor/executor.module';
import { QueueModule } from './queue/queue.module';
import { WorkflowService } from './workflow/workflow.service';
import { DatabaseModule } from './storage/database.module';
import { createWorker } from './queue/worker';
import { ExecutorService } from './executor/executor.service';
import { WorkflowRunRepository } from './storage/workflow-run.repository';

@Module({
  providers: [CoreService,WorkflowService],
  exports: [CoreService,WorkflowService],
  imports: [EngineModule, WorkflowModule, ExecutorModule, QueueModule, DatabaseModule],
  
})
export class EventbridgeModule implements OnModuleInit { 
  constructor(
    private readonly executor: ExecutorService,
    private readonly workflowService: WorkflowService,
    private readonly workflowRunRepo: WorkflowRunRepository,
  ){}
   onModuleInit() {
    createWorker(
      this.executor,
      this.workflowService,
      this.workflowRunRepo
    );}
}
