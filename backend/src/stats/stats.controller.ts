// backend/src/stats/stats.controller.ts
import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('api/admin')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats')
  getStats() {
    return this.statsService.getStats();
  }

  @Get('commandes-stats')
  getCommandesStats() {
    return this.statsService.getCommandesStats();
  }

  @Get('produits-stats')
  getProduitsStats() {
    return this.statsService.getProduitsStats();
  }

  @Get('clients-stats')
  async getClientsStats() {
    return this.statsService.getClientsStats();
  }
}
