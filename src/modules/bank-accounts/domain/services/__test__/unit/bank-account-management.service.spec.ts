import { BadRequestException } from '@nestjs/common'
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
            update: jest.fn(),
            deactivateBankAccount: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            incrementBalance: jest.fn(),
            decrementBalance: jest.fn()
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

      const result = await service.createBankAccount(bankAccountToCreateProps)

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

      const result = await service.updateBankAccount(
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

  describe('deactivateAccount', () => {
    it('should call bank account repository function to update bank account isActive status to false and return', async () => {
      const activeBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 2
      })

      jest
        .spyOn(bankAccountRepository, 'deactivateBankAccount')
        .mockResolvedValue({
          ...activeBankAccountEntity,
          isActive: false
        })

      const result = await service.deactivateBankAccount(
        activeBankAccountEntity.id
      )

      expect(bankAccountRepository.deactivateBankAccount).toBeCalledTimes(1)
      expect(bankAccountRepository.deactivateBankAccount).toBeCalledWith(
        activeBankAccountEntity.id
      )

      expect(result).toEqual({
        ...activeBankAccountEntity,
        isActive: false
      })
    })
  })

  describe('findOneBankAccount', () => {
    it('should call bank account repository function to find one bank account by ID and return', async () => {
      const activeBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 2
      })

      jest
        .spyOn(bankAccountRepository, 'findOne')
        .mockResolvedValue(activeBankAccountEntity)

      const result = await service.findOneBankAccount(
        activeBankAccountEntity.id
      )

      expect(bankAccountRepository.findOne).toBeCalledTimes(1)
      expect(bankAccountRepository.findOne).toBeCalledWith(
        activeBankAccountEntity.id
      )

      expect(result).toEqual(activeBankAccountEntity)
    })
  })

  describe('findAllBankAccounts', () => {
    it('should call bank account repository function to find all bank accounts and return without pagination', async () => {
      const firstBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 2
      })

      const secondBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 3
      })

      jest.spyOn(bankAccountRepository, 'findAll').mockResolvedValue({
        bankAccounts: [firstBankAccountEntity, secondBankAccountEntity]
      })

      const result = await service.findAllBankAccounts()

      expect(bankAccountRepository.findAll).toBeCalledTimes(1)
      expect(bankAccountRepository.findAll).toBeCalledWith(undefined, undefined)

      expect(result).toEqual({
        bankAccounts: [firstBankAccountEntity, secondBankAccountEntity]
      })
    })

    it('should call bank account repository function to find all bank accounts and return with pagination', async () => {
      const firstBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 2
      })

      const secondBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0,
        isActive: true,
        accountNumber: 3
      })

      jest.spyOn(bankAccountRepository, 'findAll').mockResolvedValue({
        bankAccounts: [firstBankAccountEntity, secondBankAccountEntity],
        page: 1,
        pageSize: 2,
        total: 2,
        pageCount: 1
      })

      const page = 1
      const pageSize = 2

      const result = await service.findAllBankAccounts(page, pageSize)

      expect(bankAccountRepository.findAll).toBeCalledTimes(1)
      expect(bankAccountRepository.findAll).toBeCalledWith(page, pageSize)

      expect(result).toEqual({
        bankAccounts: [firstBankAccountEntity, secondBankAccountEntity],
        page: 1,
        pageSize: 2,
        total: 2,
        pageCount: 1
      })
    })
  })

  describe('depositOnBankAccount', () => {
    it('should call bank account repository function to increment bank account balance and return bank account updated', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 0
      })

      const amountToDeposit = 2500

      jest.spyOn(bankAccountRepository, 'incrementBalance').mockResolvedValue({
        ...bankAccountEntity,
        balance: amountToDeposit
      })

      const result = await service.depositOnBankAccount(
        bankAccountEntity.id,
        amountToDeposit
      )

      expect(bankAccountRepository.incrementBalance).toBeCalledTimes(1)
      expect(bankAccountRepository.incrementBalance).toBeCalledWith(
        bankAccountEntity.id,
        amountToDeposit
      )

      expect(result).toEqual({
        ...bankAccountEntity,
        balance: amountToDeposit
      })
    })

    it('should throw error if amount to deposit is zero', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 100
      })

      const amountToDeposit = 0

      await expect(async () => {
        await service.depositOnBankAccount(
          bankAccountEntity.id,
          amountToDeposit
        )
      }).rejects.toThrow(BadRequestException)

      expect(bankAccountRepository.incrementBalance).toBeCalledTimes(0)
    })

    it('should throw error if amount to deposit is negative number', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 100
      })

      const amountToDeposit = -1

      await expect(async () => {
        await service.depositOnBankAccount(
          bankAccountEntity.id,
          amountToDeposit
        )
      }).rejects.toThrow(BadRequestException)

      expect(bankAccountRepository.incrementBalance).toBeCalledTimes(0)
    })
  })

  describe('withdrawOnBankAccount', () => {
    it('should call bank account repository function to decrement bank account balance and return bank account updated', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 2500
      })

      const amountToWithdraw = 500

      jest
        .spyOn(service, 'findOneBankAccount')
        .mockResolvedValue(bankAccountEntity)

      jest.spyOn(bankAccountRepository, 'decrementBalance').mockResolvedValue({
        ...bankAccountEntity,
        balance: bankAccountEntity.balance - amountToWithdraw
      })

      const result = await service.withdrawOnBankAccount(
        bankAccountEntity.id,
        amountToWithdraw
      )

      expect(bankAccountRepository.decrementBalance).toBeCalledTimes(1)
      expect(bankAccountRepository.decrementBalance).toBeCalledWith(
        bankAccountEntity.id,
        amountToWithdraw
      )

      expect(result).toEqual({
        ...bankAccountEntity,
        balance: bankAccountEntity.balance - amountToWithdraw
      })
    })

    it('should throw error if amount to withdraw is zero', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 100
      })

      const amountToWithdraw = 0

      jest
        .spyOn(service, 'findOneBankAccount')
        .mockResolvedValue(bankAccountEntity)

      await expect(async () => {
        await service.withdrawOnBankAccount(
          bankAccountEntity.id,
          amountToWithdraw
        )
      }).rejects.toThrow(BadRequestException)

      expect(bankAccountRepository.decrementBalance).toBeCalledTimes(0)
    })

    it('should throw error if amount to withdraw is negative number', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 100
      })

      jest
        .spyOn(service, 'findOneBankAccount')
        .mockResolvedValue(bankAccountEntity)

      const amountToWithdraw = -1

      await expect(async () => {
        await service.withdrawOnBankAccount(
          bankAccountEntity.id,
          amountToWithdraw
        )
      }).rejects.toThrow(BadRequestException)

      expect(bankAccountRepository.decrementBalance).toBeCalledTimes(0)
    })

    it('should throw error if amount to withdraw is greather then current bank account balance', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'POUPANCA',
        balance: 100
      })

      jest
        .spyOn(service, 'findOneBankAccount')
        .mockResolvedValue(bankAccountEntity)

      const amountToWithdraw = 200

      await expect(async () => {
        await service.withdrawOnBankAccount(
          bankAccountEntity.id,
          amountToWithdraw
        )
      }).rejects.toThrow(BadRequestException)

      expect(bankAccountRepository.decrementBalance).toBeCalledTimes(0)
    })
  })
})
