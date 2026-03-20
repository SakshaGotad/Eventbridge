import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { EngineService } from './engine.service';

@Controller('events')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Post()
  async emit(
    @Body() body: { name?: string; payload?: any }
  ) {
    const { name, payload } = body;

    // ✅ Basic validation (fast fail at controller level)
    if (!name) {
      throw new BadRequestException('Event name is required');
    }

    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Payload must be a valid object');
    }

    return this.engineService.emitEvent(name, payload);
  }
}