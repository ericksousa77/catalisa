import { Test, TestingModule } from '@nestjs/testing'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountRepository } from '@src/modules/bank-accounts/domain/interfaces/bank-account.repository.interface'

import { BankAccountManagementService } from '@src/modules/bank-accounts/domain/services/bank-account-management.service'

import { CreateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'

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
            save: jest.fn()
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
})
