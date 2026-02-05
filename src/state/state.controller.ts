import { Controller, Get, Query } from '@nestjs/common';
import { StateService } from './state.service';

@Controller('state')
export class StateController {
    constructor(private readonly stateService: StateService) {}

    @Get()
    getState(@Query('playerId') playerId: string) {
        return this.stateService.getState(playerId);
    }
    
}
