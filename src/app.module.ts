import { Module } from '@nestjs/common'

import { ConfigModule } from '@src/shared/modules/config/config.module'
import { BankAccountModule } from '@src/modules/bank-accounts/bank-accounts.module'

@Module({
  imports: [ConfigModule.forRoot(), BankAccountModule]
})
export class AppModule {}
