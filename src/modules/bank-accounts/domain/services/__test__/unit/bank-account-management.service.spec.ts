import { Test, TestingModule } from '@nestjs/testing'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { BankAccountManagementService } from '@src/modules/bank-accounts/domain/services/bank-account-management.service'

import { CreateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'
import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'

describe('BankAccountManagementService', () => {
  let service: BankAccountManagementService
  let bankAccountRepository: BankAccountRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountManagementService,
        {
          provide: BankAccountRepository,
          useValue: {
            save: jest.fn(),
            update: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<BankAccountManagementService>(
      BankAccountManagementService
    )

    bankAccountRepository = module.get<BankAccountRepository>(
      BankAccountRepository
    )
  })

  describe('create', () => {
    it('should call bank account repository function to save bank account and return bank account created', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0
      })

      const bankAccountToCreateProps: CreateBankAccountInputDto = {
        agency: bankAccountEntity.agency,
        type: bankAccountEntity.type
      }

      jest.spyOn(bankAccountRepository, 'save').mockResolvedValue({
        ...bankAccountEntity,
        accountNumber: 2,
        isActive: true
      })

      const result = await service.create(bankAccountToCreateProps)

      expect(bankAccountRepository.save).toBeCalledTimes(1)
      expect(bankAccountRepository.save).toBeCalledWith(
        expect.objectContaining({
          agency: bankAccountEntity.agency,
          type: bankAccountEntity.type
        })
      )

      expect(result).toEqual({
        ...bankAccountEntity,
        accountNumber: 2,
        isActive: true
      })
    })
  })

  describe('update', () => {
    it('should call bank account repository function to update bank account and return bank account updated', async () => {
      const oldBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0
      })

      const bankAccountToUpdateProps: UpdateBankAccountInputDto = {
        agency: 'New Mocked Agency',
        type: 'CORRENTE'
      }

      jest.spyOn(bankAccountRepository, 'update').mockResolvedValue({
        ...oldBankAccountEntity,
        accountNumber: 2,
        isActive: true,
        agency: 'New Mocked Agency',
        type: 'CORRENTE'
      })

      const result = await service.update(
        oldBankAccountEntity.id,
        bankAccountToUpdateProps
      )

      expect(bankAccountRepository.update).toBeCalledTimes(1)
      expect(bankAccountRepository.update).toBeCalledWith(
        oldBankAccountEntity.id,
        bankAccountToUpdateProps
      )

      expect(result).toEqual({
        ...oldBankAccountEntity,
        accountNumber: 2,
        isActive: true,
        agency: 'New Mocked Agency',
        type: 'CORRENTE'
      })
    })
  })
})
