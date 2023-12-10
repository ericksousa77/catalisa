import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '../domain/interfaces/bank-account.repository.interface'

import { PrismaService } from '@src/shared/modules/persistence/prisma.service'

@Injectable()
export class BankAccountPrismaRepository implements BankAccountRepository {
  private repository

  constructor(private readonly prismaService: PrismaService) {
    this.repository = this.prismaService.bankAccount
  }

  async save(
    bankAccountEntity: BankAccountEntity,
    transaction?: Prisma.TransactionClient
  ) {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const bankAccountOnDatabase = await repository.create({
      data: bankAccountEntity
    })

    return bankAccountOnDatabase
  }

  async clear(): Promise<void> {
    await this.repository.deleteMany()
  }
}
