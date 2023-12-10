import { Test, TestingModule } from '@nestjs/testing'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

import { BankAccountPrismaRepository } from '@src/modules/bank-accounts/repositories/bank-account.prisma.repository'

import { PrismaService } from '@src/shared/modules/persistence/prisma.service'

describe('BankAccountPrismaRepository', () => {
  let bankAccountRepository: BankAccountPrismaRepository
  let prismaService: PrismaService

  let model: any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountPrismaRepository,
        {
          provide: PrismaService,
          useValue: {
            bankAccount: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              update: jest.fn(),
              findFirstOrThrow: jest.fn()
            }
          }
        }
      ]
    }).compile()

    bankAccountRepository = module.get<BankAccountPrismaRepository>(
      BankAccountPrismaRepository
    )
    prismaService = module.get<PrismaService>(PrismaService)

    model = prismaService.bankAccount
  })

  it('should be defined', () => {
    expect(bankAccountRepository).toBeDefined()
  })

  describe('save', () => {
    it('should call prisma method to save bank account on database and return saved bank account entity', async () => {
      const bankAccount = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'CORRENTE',
        balance: 2000
      })

      model.create.mockResolvedValue({
        ...bankAccount,
        accountNumber: 1,
        isActive: true
      })

      const result = await bankAccountRepository.save(bankAccount)

      expect(model.create).toBeCalledTimes(1)
      expect(model.create).toHaveBeenCalledWith({
        data: { ...bankAccount }
      })

      expect(result).toEqual({
        ...bankAccount,
        accountNumber: 1,
        isActive: true
      })
    })
  })

  describe('clear', () => {
    it('should call prisma method to delete all registers on table', async () => {
      model.deleteMany.mockResolvedValue()

      await bankAccountRepository.clear()

      expect(model.deleteMany).toBeCalledTimes(1)
      expect(model.deleteMany).toHaveBeenCalledWith()
    })
  })

  describe('update', () => {
    it('should call prisma method to update bank account on database and return updated bank account entity', async () => {
      const oldBankAccount = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'CORRENTE',
        balance: 2000
      })

      model.update.mockResolvedValue({
        ...oldBankAccount,
        agency: 'New Mocked Agency',
        type: 'POUPANCA',
        accountNumber: 1,
        isActive: true
      })

      const result = await bankAccountRepository.update(oldBankAccount.id, {
        agency: 'New Mocked Agency',
        type: 'POUPANCA'
      })

      expect(model.update).toBeCalledTimes(1)
      expect(model.update).toHaveBeenCalledWith({
        where: {
          id: oldBankAccount.id
        },
        data: {
          agency: 'New Mocked Agency',
          type: 'POUPANCA'
        }
      })

      expect(result).toEqual({
        ...oldBankAccount,
        agency: 'New Mocked Agency',
        type: 'POUPANCA',
        accountNumber: 1,
        isActive: true
      })
    })
  })

  describe('deactivateBankAccount', () => {
    it('should call prisma method to update bank account isActive status to false on database ', async () => {
      const activeBankAccount = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'CORRENTE',
        balance: 2000,
        isActive: true,
        accountNumber: 1
      })

      model.update.mockResolvedValue({
        ...activeBankAccount,
        isActive: false
      })

      const result = await bankAccountRepository.deactivateBankAccount(
        activeBankAccount.id
      )

      expect(model.update).toBeCalledTimes(1)
      expect(model.update).toHaveBeenCalledWith({
        where: {
          id: activeBankAccount.id
        },
        data: {
          isActive: false
        }
      })

      expect(result).toEqual({
        ...activeBankAccount,
        isActive: false
      })
    })
  })

  describe('findOne', () => {
    it('should call prisma method to find one bank account by ID ', async () => {
      const bankAccount = BankAccountEntity.create({
        agency: 'Mocked Agency',
        type: 'CORRENTE',
        balance: 2000,
        isActive: true,
        accountNumber: 1
      })

      model.findFirstOrThrow.mockResolvedValue({
        ...bankAccount,
        Transactions: null
      })

      const result = await bankAccountRepository.findOne(bankAccount.id)

      expect(model.findFirstOrThrow).toBeCalledTimes(1)
      expect(model.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: bankAccount.id
        },
        include: {
          Transactions: true
        }
      })

      expect(result).toEqual({ ...bankAccount, Transactions: null })
    })
  })
})
