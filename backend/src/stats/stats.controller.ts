// backend/src/stats/stats.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('api/admin')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats')
  getStats() {
    return this.statsService.getStats();
  }

  @Get('commandes-stats')
  getCommandesStats(@Query('range') range?: string) {
    return this.statsService.getCommandesStats(range);
  }

  @Get('produits-stats')
  getProduitsStats(@Query('range') range?: string) {
    return this.statsService.getProduitsStats(range);
  }

  @Get('clients-stats')
  async getClientsStats(@Query('range') range?: string) {
    return this.statsService.getClientsStats(range);
  }
}
