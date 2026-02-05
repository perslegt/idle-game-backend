import { Body, Controller, ParseUUIDPipe, Param, Post } from "@nestjs/common";

@Controller('cities/:cityId/troops')
export class TroopsController {
    @Post(':troopType/train')
    train(
        @Param('cityId', new ParseUUIDPipe({ version: '4' })) cityId: string,
        @Param('troopType') troopType: string,
        @Body() body: any,
    ) {
        return {
            ok: true,
            cityId,
            troopType,
            body,
            note: 'Issue 6: Troop training not implemented yet',
        }
    }
}