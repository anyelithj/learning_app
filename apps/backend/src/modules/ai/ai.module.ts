import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AIClientService } from './ai-client.service';
import { AIController } from './ai.controller';
// [AIModule]: provee AIClientService a otros modulos + controller proxy /ai/feedback/* | [Patron]: Module + DI | [Principio]: ISP

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 30_000, maxRedirects: 2 })],
  controllers: [AIController],
  providers: [AIClientService],
  exports: [AIClientService],
})
export class AIModule {}
