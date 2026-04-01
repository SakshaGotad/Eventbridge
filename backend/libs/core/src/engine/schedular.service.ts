import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { WorkflowService } from '../workflow/workflow.service';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowRunRepository } from '../storage/workflow-run.repository';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private workflowService: WorkflowService,
    private queueService: QueueService,
    private schedulerRegistry: SchedulerRegistry,
    private workflowRunRepo: WorkflowRunRepository,
  ) {}

  onModuleInit() {
    const workflows = this.workflowService.getAllWorkflows();

    for (const wf of workflows) {
      if (wf.trigger?.event === 'cron') {
        this.registerCron(wf);
      }
    }
  }

  registerCron(workflow: any) {
    const job = new CronJob(workflow.trigger.cron, async () => {
      console.log(`Cron triggered: ${workflow.name}`);

      const runId = uuidv4();

      await this.workflowRunRepo.create(runId, workflow.name, {});

      await this.queueService.addWorkflowJob({
        workflowName: workflow.name,
        payload: {},
        runId,
        stepIndex: 0,
      });
    });

    this.schedulerRegistry.addCronJob(workflow.name, job);
    job.start();
  }
}