import { Module } from '@nestjs/common';
import { ControlGateway } from './control.gateway';

@Module({
  providers: [ControlGateway]
})
export class ControlModule {}
