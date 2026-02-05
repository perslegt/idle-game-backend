import { Controller, Get, ParseUUIDPipe, Query } from '@nestjs/common';
import { StateService } from './state.service';

@Controller('state')
export class StateController {
    constructor(private readonly stateService: StateService) {}

    @Get()
    getState(@Query('playerId', new ParseUUIDPipe({ version: '4' })) playerId: string) {
        return this.stateService.getState(playerId);
    }

}
