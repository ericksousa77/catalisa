import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { HttpAdapterHost } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'

import { AppModule } from '@src/app.module'
import { PersistenceModule } from '@src/shared/modules/persistence/persistence.module'

import { BankAccountPrismaRepository } from '@src/modules/bank-accounts/repositories/bank-account.prisma.repository'

import { ConfigService } from '@src/shared/modules/config/service/config.service'
import { PrismaService } from '@src/shared/modules/persistence/prisma.service'

import { CreateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'
import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'
import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'

import { PrismaClientExceptionFilter } from '@src/shared/modules/persistence/prisma-client-exception/prisma-client-exception.filter'

describe('Bank Account Controller (e2e)', () => {
  let app: INestApplication
  let bankAccountRepository: BankAccountPrismaRepository
  let module: TestingModule
  let prismaService: PrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, PersistenceModule],
      providers: [ConfigService, BankAccountPrismaRepository, PrismaService]
    }).compile()

    app = module.createNestApplication()

    const { httpAdapter } = app.get(HttpAdapterHost)

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      })
    )

    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

    await app.init()

    bankAccountRepository = module.get<BankAccountPrismaRepository>(
      BankAccountPrismaRepository
    )

    prismaService = module.get<PrismaService>(PrismaService)
  })

  beforeEach(async () => {
    await prismaService.transaction.deleteMany()
    await bankAccountRepository.clear()
  })

  afterAll(async () => {
    await prismaService.transaction.deleteMany()
    await bankAccountRepository.clear()
    module.close()
  })

  describe('Bank Account Management - create bank account', () => {
    it('should create and return a new bank account', async () => {
      const newBankAccountProps: CreateBankAccountInputDto = {
        agency: 'Mocked Agency 123',
        type: 'CORRENTE'
      }

      const response = await request(app.getHttpServer())
        .post('/bank-accounts')
        .send(newBankAccountProps)

      const { id, agency, type, balance, createdAt, updatedAt, isActive } =
        response.body

      expect(id).toBeDefined()
      expect(agency).toBe(newBankAccountProps.agency)
      expect(type).toBe(newBankAccountProps.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(0)
      expect(isActive).toEqual(true)
    })

    it('should throw error if account type is not POUPANCA or CORRENTE', async () => {
      const newBankAccountProps = {
        agency: 'Mocked Agency 123',
        type: 'name not allowed'
      }

      const response = await request(app.getHttpServer())
        .post('/bank-accounts')
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe(
        'type must be one of the following values: CORRENTE, POUPANCA'
      )
      expect(error).toBe('Bad Request')
    })

    it('should throw error if account type is not send on request body', async () => {
      const newBankAccountProps = {
        agency: 'Mocked Agency 123'
      }

      const response = await request(app.getHttpServer())
        .post('/bank-accounts')
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe(
        'type must be one of the following values: CORRENTE, POUPANCA'
      )
      expect(message[1]).toBe('type should not be empty')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if account agency is not send on request body', async () => {
      const newBankAccountProps = {
        type: 'CORRENTE'
      }

      const response = await request(app.getHttpServer())
        .post('/bank-accounts')
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[1]).toBe('agency should not be empty')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - update bank account', () => {
    it('should update and return a bank account', async () => {
      const oldBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0
      })

      await bankAccountRepository.save(oldBankAccountEntity)

      const newBankAccountProps: UpdateBankAccountInputDto = {
        agency: 'Mocked Agency 123',
        type: 'CORRENTE'
      }

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${oldBankAccountEntity.id}`)
        .send(newBankAccountProps)

      const { id, agency, type, balance, createdAt, updatedAt, isActive } =
        response.body

      expect(id).toEqual(oldBankAccountEntity.id)
      expect(agency).toBe(newBankAccountProps.agency)
      expect(type).toBe(newBankAccountProps.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(0)
      expect(isActive).toEqual(true)
    })

    it('should throw error if bank account to update not exists on database', async () => {
      const newBankAccountProps: UpdateBankAccountInputDto = {
        agency: 'Mocked Agency 123',
        type: 'CORRENTE'
      }

      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}`)
        .send(newBankAccountProps)

      const { statusCode, message } = response.body

      expect(response.status).toEqual(404)

      expect(statusCode).toBe(404)
      expect(message).toBe('Not Found')
    })

    it('should throw error if bankAccountId is sended but is not UUID', async () => {
      const newBankAccountProps: UpdateBankAccountInputDto = {
        agency: 'Mocked Agency 123',
        type: 'CORRENTE'
      }

      const mockedFakeUUID = '123'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedFakeUUID}`)
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('bankAccountId must be a UUID')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if account type is sended but is not POUPANCA or CORRENTE', async () => {
      const oldBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0
      })

      await bankAccountRepository.save(oldBankAccountEntity)

      const newBankAccountProps = {
        agency: 'Mocked Agency 123',
        type: 'test'
      }

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${oldBankAccountEntity.id}`)
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe(
        'type must be one of the following values: CORRENTE, POUPANCA'
      )
      expect(error).toBe('Bad Request')
    })

    it('should throw error if account agency is not string', async () => {
      const oldBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0
      })

      await bankAccountRepository.save(oldBankAccountEntity)

      const newBankAccountProps = {
        agency: 1,
        type: 'CORRENTE'
      }

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${oldBankAccountEntity.id}`)
        .send(newBankAccountProps)

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('agency must be a string')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - deactivate bank account', () => {
    it('should deactivate and return a bank account', async () => {
      const activeBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(activeBankAccountEntity)

      const response = await request(app.getHttpServer()).delete(
        `/bank-accounts/${activeBankAccountEntity.id}`
      )

      const { id, agency, type, balance, createdAt, updatedAt, isActive } =
        response.body

      expect(response.status).toEqual(200)

      expect(id).toEqual(activeBankAccountEntity.id)
      expect(agency).toBe(activeBankAccountEntity.agency)
      expect(type).toBe(activeBankAccountEntity.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(0)
      expect(isActive).toEqual(false)
    })

    it('should throw error if bank account to deactivate not exists on database', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const response = await request(app.getHttpServer()).delete(
        `/bank-accounts/${mockedUUID}`
      )

      const { statusCode, message } = response.body

      expect(response.status).toEqual(404)

      expect(statusCode).toBe(404)
      expect(message).toBe('Not Found')
    })

    it('should throw error if bankAccountId is sended but is not a uuid', async () => {
      const mockedFakeUUID = '123'

      const response = await request(app.getHttpServer()).delete(
        `/bank-accounts/${mockedFakeUUID}`
      )

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('bankAccountId must be a UUID')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - find one bank account', () => {
    it('should find by id and return a bank account', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(bankAccountEntity)

      const response = await request(app.getHttpServer()).get(
        `/bank-accounts/${bankAccountEntity.id}`
      )

      const {
        id,
        agency,
        type,
        balance,
        createdAt,
        updatedAt,
        isActive,
        Transactions
      } = response.body

      expect(response.status).toEqual(200)

      expect(id).toEqual(bankAccountEntity.id)
      expect(agency).toBe(bankAccountEntity.agency)
      expect(type).toBe(bankAccountEntity.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(bankAccountEntity.balance)
      expect(isActive).toEqual(bankAccountEntity.isActive)
      expect(Transactions).toEqual([])
    })

    it('should find by id and return a bank account with transactions', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 1000 + 500 /*deposit*/ - 200 /*withdraw*/,
        isActive: true
      })

      await bankAccountRepository.save(bankAccountEntity)

      const mockedCurrentTimestamp = new Date()

      //transactions criadas uma por vez para garantir a ordem de criação
      const depositTransaction = await prismaService.transaction.create({
        data: {
          id: randomUUID(),
          type: 'DEPOSITO',
          value: 500,
          bankAccountId: bankAccountEntity.id,
          createdAt: mockedCurrentTimestamp
        }
      })

      const withdrawTransaction = await prismaService.transaction.create({
        data: {
          id: randomUUID(),
          type: 'SAQUE',
          value: 200,
          bankAccountId: bankAccountEntity.id,
          createdAt: mockedCurrentTimestamp
        }
      })

      const response = await request(app.getHttpServer()).get(
        `/bank-accounts/${bankAccountEntity.id}`
      )

      const {
        id,
        agency,
        type,
        balance,
        createdAt,
        updatedAt,
        isActive,
        Transactions
      } = response.body

      expect(response.status).toEqual(200)

      //bank account validations
      expect(id).toEqual(bankAccountEntity.id)
      expect(agency).toBe(bankAccountEntity.agency)
      expect(type).toBe(bankAccountEntity.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(bankAccountEntity.balance)
      expect(isActive).toEqual(bankAccountEntity.isActive)

      //transactions validation

      //deposit transaction validation
      expect(Transactions[0].value).toEqual(depositTransaction.value)
      expect(Transactions[0].type).toEqual(depositTransaction.type)
      expect(Transactions[0].bankAccountId).toEqual(
        depositTransaction.bankAccountId
      )
      expect(Transactions[0].createdAt).toBeDefined()

      //withdraw transaction validation
      expect(Transactions[1].value).toEqual(withdrawTransaction.value)
      expect(Transactions[1].type).toEqual(withdrawTransaction.type)
      expect(Transactions[1].bankAccountId).toEqual(
        withdrawTransaction.bankAccountId
      )
      expect(Transactions[1].createdAt).toBeDefined()
    })

    it('should throw error if bank account to show not exists on database', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const response = await request(app.getHttpServer()).get(
        `/bank-accounts/${mockedUUID}`
      )

      const { statusCode, message } = response.body

      expect(response.status).toEqual(404)

      expect(statusCode).toBe(404)
      expect(message).toBe('Not Found')
    })

    it('should throw error if bankAccountId is sended but is not a uuid', async () => {
      const mockedFakeUUID = '123'

      const response = await request(app.getHttpServer()).get(
        `/bank-accounts/${mockedFakeUUID}`
      )

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('bankAccountId must be a UUID')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - find all bank account', () => {
    it('should find all bank accounts and return without pagination', async () => {
      //irei criar as contas bancárias sem promise all para garantir o controle da ordem de crição
      const firstBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 121',
        type: 'CORRENTE',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(firstBankAccountEntity)

      const secondBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 122',
        type: 'POUPANCA',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(secondBankAccountEntity)

      const response = await request(app.getHttpServer()).get('/bank-accounts')

      const { page, pageSize, pageCount, total, bankAccounts } = response.body

      expect(response.status).toEqual(200)

      //validate first bank account validations
      expect(bankAccounts[0].id).toEqual(firstBankAccountEntity.id)
      expect(bankAccounts[0].agency).toBe(firstBankAccountEntity.agency)
      expect(bankAccounts[0].type).toBe(firstBankAccountEntity.type)
      expect(bankAccounts[0].createdAt).toBeDefined()
      expect(bankAccounts[0].updatedAt).toBeDefined()
      expect(bankAccounts[0].balance).toEqual(firstBankAccountEntity.balance)
      expect(bankAccounts[0].isActive).toEqual(firstBankAccountEntity.isActive)

      //validate second bank account validations
      expect(bankAccounts[1].id).toEqual(secondBankAccountEntity.id)
      expect(bankAccounts[1].agency).toBe(secondBankAccountEntity.agency)
      expect(bankAccounts[1].type).toBe(secondBankAccountEntity.type)
      expect(bankAccounts[1].createdAt).toBeDefined()
      expect(bankAccounts[1].updatedAt).toBeDefined()
      expect(bankAccounts[1].balance).toEqual(secondBankAccountEntity.balance)
      expect(bankAccounts[1].isActive).toEqual(secondBankAccountEntity.isActive)

      //validate pagination parameters
      expect(page).toBeUndefined()
      expect(pageSize).toBeUndefined()
      expect(pageCount).toBeUndefined()
      expect(total).toBeUndefined()
    })

    it('should find all bank accounts and return with pagination', async () => {
      //irei criar as contas bancárias sem promise all para garantir o controle da ordem de crição
      const firstBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(firstBankAccountEntity)

      const secondBankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 124',
        type: 'POUPANCA',
        balance: 0,
        isActive: true
      })

      await bankAccountRepository.save(secondBankAccountEntity)

      const response = await request(app.getHttpServer())
        .get('/bank-accounts')
        .query({ page: 1, pageSize: 2 })

      const { page, pageSize, pageCount, total, bankAccounts } = response.body

      expect(response.status).toEqual(200)

      //validate first bank account validations
      expect(bankAccounts[0].id).toEqual(firstBankAccountEntity.id)
      expect(bankAccounts[0].agency).toBe(firstBankAccountEntity.agency)
      expect(bankAccounts[0].type).toBe(firstBankAccountEntity.type)
      expect(bankAccounts[0].createdAt).toBeDefined()
      expect(bankAccounts[0].updatedAt).toBeDefined()
      expect(bankAccounts[0].balance).toEqual(firstBankAccountEntity.balance)
      expect(bankAccounts[0].isActive).toEqual(firstBankAccountEntity.isActive)

      //validate second bank account validations
      expect(bankAccounts[1].id).toEqual(secondBankAccountEntity.id)
      expect(bankAccounts[1].agency).toBe(secondBankAccountEntity.agency)
      expect(bankAccounts[1].type).toBe(secondBankAccountEntity.type)
      expect(bankAccounts[1].createdAt).toBeDefined()
      expect(bankAccounts[1].updatedAt).toBeDefined()
      expect(bankAccounts[1].balance).toEqual(secondBankAccountEntity.balance)
      expect(bankAccounts[1].isActive).toEqual(secondBankAccountEntity.isActive)

      //validate pagination parameters
      expect(page).toEqual(1)
      expect(pageSize).toEqual(2)
      expect(pageCount).toEqual(1)
      expect(total).toEqual(2)
    })

    it('should return a empty array if not exists bank account on database without pagination', async () => {
      const response = await request(app.getHttpServer()).get('/bank-accounts')

      const { bankAccounts, page, pageSize, pageCount, total } = response.body

      expect(response.status).toEqual(200)

      expect(bankAccounts).toEqual([])

      //validate pagination parameters
      expect(page).toBeUndefined()
      expect(pageSize).toBeUndefined()
      expect(pageCount).toBeUndefined()
      expect(total).toBeUndefined()
    })

    it('should return a empty array if not exists bank account on database with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/bank-accounts')
        .query({ page: 1, pageSize: 2 })

      const { bankAccounts, page, pageSize, pageCount, total } = response.body

      expect(response.status).toEqual(200)

      expect(bankAccounts).toEqual([])

      //validate pagination parameters
      expect(page).toEqual(1)
      expect(pageSize).toEqual(2)
      expect(pageCount).toEqual(0)
      expect(total).toEqual(0)
    })

    it('should throw error if page is sended but is not a number', async () => {
      const mockedNotNumberPage = 'casa'

      const response = await request(app.getHttpServer())
        .get('/bank-accounts')
        .query({ page: mockedNotNumberPage, pageSize: 2 })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('page must not be less than 1')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if pageSize is sended but is not a number', async () => {
      const mockedNotNumberPageSize = 'casa'

      const response = await request(app.getHttpServer())
        .get('/bank-accounts')
        .query({ page: 1, pageSize: mockedNotNumberPageSize })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('pageSize must not be less than 1')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - deposit on bank account', () => {
    it('should deposit on bank account and return a bank account updated', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 100
      })

      await bankAccountRepository.save(bankAccountEntity)

      const amountToDeposit = 1500

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${bankAccountEntity.id}/deposit`)
        .send({
          value: amountToDeposit
        })

      const { id, agency, type, balance, createdAt, updatedAt, isActive } =
        response.body

      expect(response.status).toEqual(200)

      expect(id).toEqual(bankAccountEntity.id)
      expect(agency).toBe(bankAccountEntity.agency)
      expect(type).toBe(bankAccountEntity.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(amountToDeposit + bankAccountEntity.balance)
      expect(isActive).toEqual(true)
    })

    it('should throw error if bank account to deposit not exists on database', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToDeposit = 1500

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/deposit`)
        .send({ value: amountToDeposit })

      const { statusCode, message } = response.body

      expect(response.status).toEqual(404)

      expect(statusCode).toBe(404)
      expect(message).toBe('Not Found')
    })

    it('should throw error if bankAccountId is sended but is not UUID', async () => {
      const amountToDeposit = 1500

      const mockedFakeUUID = '123'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedFakeUUID}/deposit`)
        .send({ value: amountToDeposit })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('bankAccountId must be a UUID')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to deposit is zero', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToDeposit = 0

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/deposit`)
        .send({ value: amountToDeposit })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to deposit is negative number', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToDeposit = -1

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/deposit`)
        .send({ value: amountToDeposit })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to deposit is not a number', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToDeposit = 'mockedNotNumberValueToDeposit'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/deposit`)
        .send({ value: amountToDeposit })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })
  })

  describe('Bank Account Management - withdraw on bank account', () => {
    it('should withdraw on bank account and return a bank account updated', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 2300
      })

      await bankAccountRepository.save(bankAccountEntity)

      const amountToWithdraw = 300

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${bankAccountEntity.id}/withdraw`)
        .send({
          value: amountToWithdraw
        })

      const { id, agency, type, balance, createdAt, updatedAt, isActive } =
        response.body

      expect(response.status).toEqual(200)

      expect(id).toEqual(bankAccountEntity.id)
      expect(agency).toBe(bankAccountEntity.agency)
      expect(type).toBe(bankAccountEntity.type)
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
      expect(balance).toEqual(bankAccountEntity.balance - amountToWithdraw)
      expect(isActive).toEqual(true)
    })

    it('should throw error if amount to withdraw is greather then current bank account balance', async () => {
      const bankAccountEntity = BankAccountEntity.create({
        agency: 'Mocked Agency 123',
        type: 'CORRENTE',
        balance: 2300
      })

      await bankAccountRepository.save(bankAccountEntity)

      const amountToWithdraw = 3000

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${bankAccountEntity.id}/withdraw`)
        .send({
          value: amountToWithdraw
        })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message).toBe(
        'The amount to be withdrawn cannot be greater than the current balance'
      )
      expect(error).toBe('Bad Request')
    })

    it('should throw error if bank account to withdraw not exists on database', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToWithdraw = 1500

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/withdraw`)
        .send({ value: amountToWithdraw })

      const { statusCode, message } = response.body

      expect(response.status).toEqual(404)

      expect(statusCode).toBe(404)
      expect(message).toBe('Not Found')
    })

    it('should throw error if bankAccountId is sended but is not UUID', async () => {
      const amountToWithdraw = 1500

      const mockedFakeUUID = '123'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedFakeUUID}/withdraw`)
        .send({ value: amountToWithdraw })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('bankAccountId must be a UUID')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to withdraw is zero', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToWithdraw = 0

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/withdraw`)
        .send({ value: amountToWithdraw })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to withdraw is negative number', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToWithdraw = -1

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/withdraw`)
        .send({ value: amountToWithdraw })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })

    it('should throw error if amount to withdraw is not a number', async () => {
      const mockedUUID = '34c65aa9-0fc8-4f87-8696-5b1448a06ac4'

      const amountToWithdraw = 'mockedNotNumberValueToWithdraw'

      const response = await request(app.getHttpServer())
        .put(`/bank-accounts/${mockedUUID}/withdraw`)
        .send({ value: amountToWithdraw })

      const { statusCode, message, error } = response.body

      expect(response.status).toEqual(400)

      expect(statusCode).toBe(400)
      expect(message[0]).toBe('value must not be less than 1')
      expect(error).toBe('Bad Request')
    })
  })
})
