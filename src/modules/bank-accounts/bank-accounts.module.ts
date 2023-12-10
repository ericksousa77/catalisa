import { Module } from '@nestjs/common'

import { ConfigModule } from '@src/shared/modules/config/config.module'
import { PersistenceModule } from '@src/shared/modules/persistence/persistence.module'

import { BankAccountController } from '@src/modules/bank-accounts/http/controllers/bank-account.controller'

import { BankAccountManagementService } from '@src/modules/bank-accounts/domain/services/bank-account-management.service'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { BankAccountPrismaRepository } from '@src/modules/bank-accounts/repositories/bank-account.prisma.repository'

@Module({
  imports: [ConfigModule.forRoot(), PersistenceModule],
  controllers: [BankAccountController],
  providers: [
    BankAccountManagementService,
    {
      provide: BankAccountRepository,
      useClass: BankAccountPrismaRepository
    }
  ],
  exports: [BankAccountManagementService]
})
export class BankAccountModule {}
