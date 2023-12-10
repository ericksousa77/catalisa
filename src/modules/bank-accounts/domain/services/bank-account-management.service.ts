import { Injectable } from '@nestjs/common'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { CreateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'
import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'
import { GetAllBankAccountsOutputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/get-all-bank-accounts-dto'

@Injectable()
export class BankAccountManagementService {
  constructor(private readonly bankAccountRepository: BankAccountRepository) {}
  async createBankAccount(
    bankAccountProps: CreateBankAccountInputDto
  ): Promise<BankAccountEntity> {
    const bankAccountEntity = BankAccountEntity.create({
      ...bankAccountProps,
      balance: 0
    })

    return this.bankAccountRepository.save(bankAccountEntity)
  }

  async updateBankAccount(
    bankAccountId: string,
    bankAccountProps: UpdateBankAccountInputDto
  ): Promise<BankAccountEntity> {
    return this.bankAccountRepository.update(bankAccountId, bankAccountProps)
  }

  async deactivateBankAccount(
    bankAccountId: string
  ): Promise<BankAccountEntity> {
    return this.bankAccountRepository.deactivateBankAccount(bankAccountId)
  }

  async findOneBankAccount(bankAccountId: string): Promise<BankAccountEntity> {
    return this.bankAccountRepository.findOne(bankAccountId)
  }

  async findAllBankAccounts(
    page?: number,
    pageSize?: number
  ): Promise<GetAllBankAccountsOutputDto> {
    return this.bankAccountRepository.findAll(page, pageSize)
  }
}
