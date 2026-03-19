import { Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import { DatabaseModule } from '../storage/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ExecutorService],
  exports: [ExecutorService],
})
export class ExecutorModule {} 
 