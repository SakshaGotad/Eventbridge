import { Module } from '@nestjs/common';
import { CoreService } from './eventbridge.service';
import { EngineModule } from './engine/engine.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExecutorModule } from './executor/executor.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { WorkflowService } from './workflow/workflow.service';

@Module({
  providers: [CoreService,WorkflowService],
  exports: [CoreService,WorkflowService],
  imports: [EngineModule, WorkflowModule, ExecutorModule, QueueModule, StorageModule],
})
export class EventbridgeModule { }
