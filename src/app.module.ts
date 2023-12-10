import { Module } from '@nestjs/common'

import { ConfigModule } from '@src/shared/modules/config/config.module'

@Module({
  imports: [ConfigModule.forRoot()]
})
export class AppModule {}
