import { Prisma } from '@prisma/client'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export abstract class BankAccountRepository {
  abstract save(
    bankAccount: BankAccountEntity,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity>

  abstract clear(): Promise<void>
}
