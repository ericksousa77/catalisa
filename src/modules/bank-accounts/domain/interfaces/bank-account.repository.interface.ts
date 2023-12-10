import { Prisma } from '@prisma/client'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'
import { GetAllBankAccountsOutputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/get-all-bank-accounts-dto'

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

  abstract deactivateBankAccount(
    bankAccountId: string,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity>

  abstract findOne(
    bankAccountId: string,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity>

  abstract findAll(
    page?: number,
    pageSize?: number,
    transaction?: Prisma.TransactionClient
  ): Promise<GetAllBankAccountsOutputDto>
}
