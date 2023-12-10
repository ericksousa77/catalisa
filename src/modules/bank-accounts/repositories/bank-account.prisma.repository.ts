import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { PrismaService } from '@src/shared/modules/persistence/prisma.service'

import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'

@Injectable()
export class BankAccountPrismaRepository implements BankAccountRepository {
  private repository

  constructor(private readonly prismaService: PrismaService) {
    this.repository = this.prismaService.bankAccount
  }

  async save(
    bankAccountEntity: BankAccountEntity,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
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

  async update(
    bankAccountId: string,
    bankAccountEntity: UpdateBankAccountInputDto,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const bankAccountOnDatabase = await repository.update({
      where: {
        id: bankAccountId
      },
      data: bankAccountEntity
    })

    return new BankAccountEntity(bankAccountOnDatabase)
  }

  async deactivateBankAccount(
    bankAccountId: string,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const bankAccountOnDatabase = await repository.update({
      where: {
        id: bankAccountId
      },
      data: {
        isActive: false
      }
    })

    return new BankAccountEntity(bankAccountOnDatabase)
  }

  async findOne(
    bankAccountId: string,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const bankAccountOnDatabase = await repository.findFirstOrThrow({
      where: {
        id: bankAccountId
      },
      include: {
        Transactions: true
      }
    })

    const bankAccoutEntity = plainToInstance(
      BankAccountEntity,
      bankAccountOnDatabase
    )

    return bankAccoutEntity
  }
}
