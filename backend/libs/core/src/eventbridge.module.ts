import { Module } from '@nestjs/common';
import { CoreService } from './eventbridge.service';
import { EngineModule } from './engine/engine.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExecutorModule } from './executor/executor.module';
import { QueueModule } from './queue/queue.module';
import { WorkflowService } from './workflow/workflow.service';
import { DatabaseModule } from './storage/database.module';

@Module({
  providers: [CoreService,WorkflowService],
  exports: [CoreService,WorkflowService],
  imports: [EngineModule, WorkflowModule, ExecutorModule, QueueModule, DatabaseModule],
})
export class EventbridgeModule { }
