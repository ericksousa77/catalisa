import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { PrismaService } from '@src/shared/modules/persistence/prisma.service'

import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'
import { GetAllBankAccountsOutputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/get-all-bank-accounts-dto'
import { randomUUID } from 'crypto'

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

    return new BankAccountEntity(bankAccountOnDatabase)
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
      data: { ...bankAccountEntity, updatedAt: new Date() }
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
        isActive: false,
        updatedAt: new Date()
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

    const bankAccountEntity = plainToInstance(
      BankAccountEntity,
      bankAccountOnDatabase
    )

    return bankAccountEntity
  }

  async findAll(
    page?: number,
    pageSize?: number,
    transaction?: Prisma.TransactionClient
  ): Promise<GetAllBankAccountsOutputDto> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const paginationParamsForQuery = {
      take: pageSize,
      skip: (Number(page) - 1) * Number(pageSize)
    }

    const [bankAccountsOnDatabase, total] = await Promise.all([
      repository.findMany({
        ...(!!page && !!pageSize ? paginationParamsForQuery : {}),
        orderBy: {
          accountNumber: 'asc'
        }
      }),
      repository.count()
    ])

    const bankAccountEntities: BankAccountEntity[] = plainToInstance(
      BankAccountEntity,
      bankAccountsOnDatabase
    )

    const pageCount = Math.ceil(total / Number(pageSize))

    if (!!page && !!pageSize) {
      return {
        bankAccounts: bankAccountEntities,
        page,
        pageSize,
        total,
        pageCount
      }
    }

    return { bankAccounts: bankAccountEntities }
  }

  async incrementBalance(
    bankAccountId: string,
    amountToDeposit: number,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const currentTimestamp = new Date()

    const bankAccountOnDatabase = await repository.update({
      where: {
        id: bankAccountId
      },
      data: {
        balance: {
          increment: amountToDeposit
        },
        Transactions: {
          create: {
            id: randomUUID(),
            createdAt: currentTimestamp,
            type: 'DEPOSITO',
            value: amountToDeposit
          }
        },
        updatedAt: currentTimestamp
      }
    })

    return new BankAccountEntity(bankAccountOnDatabase)
  }

  async decrementBalance(
    bankAccountId: string,
    amountToWithdraw: number,
    transaction?: Prisma.TransactionClient
  ): Promise<BankAccountEntity> {
    const repository =
      transaction && transaction instanceof PrismaService
        ? transaction.bankAccount
        : this.repository

    const currentTimestamp = new Date()

    const bankAccountOnDatabase = await repository.update({
      where: {
        id: bankAccountId
      },
      data: {
        balance: {
          decrement: amountToWithdraw
        },
        Transactions: {
          create: {
            id: randomUUID(),
            createdAt: currentTimestamp,
            type: 'SAQUE',
            value: amountToWithdraw
          }
        },
        updatedAt: currentTimestamp
      }
    })

    return new BankAccountEntity(bankAccountOnDatabase)
  }
}
