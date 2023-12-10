import { ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientExceptionFilter } from '../../prisma-client-exception.filter'
import { Response } from 'express'
import { Prisma } from '@prisma/client'

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaClientExceptionFilter]
    }).compile()

    filter = module.get<PrismaClientExceptionFilter>(
      PrismaClientExceptionFilter
    )
  })

  it('should be defined', () => {
    expect(filter).toBeDefined()
  })

  it('should handle Prisma.PrismaClientKnownRequestError with code P2025', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('', {
      code: 'P2025',
      clientVersion: '5.2.0'
    })

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response

    const host = {
      switchToHttp: () => ({
        getResponse: () => response
      })
    } as ArgumentsHost

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      exceptionMessage: ''
    })
  })

  it('should handle Prisma.PrismaClientKnownRequestError with code P2002', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Error message',
      {
        code: 'P2002',
        clientVersion: '5.2.0',
        meta: { target: ['meta_target'] }
      }
    )

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response

    const host = {
      switchToHttp: () => ({
        getResponse: () => response
      })
    } as ArgumentsHost

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT)
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message:
        'The error occurred due to a unique constraint violation in the database',
      columnError: ['meta_target']
    })
  })
})
