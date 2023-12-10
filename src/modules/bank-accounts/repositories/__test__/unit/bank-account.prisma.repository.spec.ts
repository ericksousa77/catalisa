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
              update: jest.fn()
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
})
