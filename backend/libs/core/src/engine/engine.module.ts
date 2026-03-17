import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { WorkflowService } from '../workflow/workflow.service';
import { ExecutorService } from '../executor/executor.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { ExecutorModule } from '../executor/executor.module';

@Module({
  providers: [EngineService,WorkflowService,ExecutorService],
  imports: [WorkflowModule, ExecutorModule],
  exports: [EngineService,WorkflowService,ExecutorService],
})
export class EngineModule {}
