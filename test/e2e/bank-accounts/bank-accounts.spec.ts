import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { HttpAdapterHost } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@src/app.module'
import { PersistenceModule } from '@src/shared/modules/persistence/persistence.module'

import { ConfigService } from '@src/shared/modules/config/service/config.service'

import { PrismaClientExceptionFilter } from '@src/shared/modules/persistence/prisma-client-exception/prisma-client-exception.filter'
import { BankAccountPrismaRepository } from '@src/modules/bank-accounts/repositories/bank-account.prisma.repository'
import { CreateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'
import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'
import { UpdateBankAccountInputDto } from '@src/modules/bank-accounts/http/dtos/bank-account/update-bank-account-dto'

describe('Bank Account Controller (e2e)', () => {
  let app: INestApplication
  let bankAccountRepository: BankAccountPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, PersistenceModule],
      providers: [ConfigService, BankAccountPrismaRepository]
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
  })

  beforeEach(async () => {
    await bankAccountRepository.clear()
  })

  afterAll(async () => {
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

    it('should throw error if bankAccountId is sended but is not UIID', async () => {
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

    // TODO: futuramente adicionar um caso de teste em que é retornado uma conta que contem transações. Nesse teste validar as transações também

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
})
