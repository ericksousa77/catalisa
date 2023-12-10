import { Module } from '@nestjs/common'

import { ConfigModule } from '@src/shared/modules/config/config.module'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [],
  exports: []
})
export class TransferModule {}
