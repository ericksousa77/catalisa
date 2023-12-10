import { Prisma } from '@prisma/client'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'
import { UpdateBankAccountInputDto } from '../../http/dtos/bank-account/update-bank-account-dto'

export abstract class BankAccountRepository {
  abstract save(
    bankAccount: BankAccountEntity,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity>

  abstract clear(): Promise<void>

  abstract update(
    bankAccountId: string,
    bankAccount: UpdateBankAccountInputDto,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity>
}
