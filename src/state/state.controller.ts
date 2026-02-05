import { Controller, Get, Query } from '@nestjs/common';

@Controller('state')
export class StateController {
  @Get()
  getState(@Query('playerId') playerId?: string) {
    return {
      ok: true,
      playerId: playerId ?? null,
      note: 'Issue #4 skeleton - next step will add tick + state load',
    };
  }
}
