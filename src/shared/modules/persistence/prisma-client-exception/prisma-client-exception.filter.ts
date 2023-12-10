import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  // private readonly logger = new Logger(PrismaClientExceptionFilter.name)
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    // this.logger.error(exception)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT
        response.status(status).json({
          statusCode: status,
          message:
            'The error occurred due to a unique constraint violation in the database',
          columnError: exception?.meta?.target
        })
        break
      }

      case 'P2025': {
        const status = HttpStatus.NOT_FOUND
        response.status(status).json({
          statusCode: status,
          message: 'Not Found',
          exceptionMessage: exception?.message
        })
        break
      }
      //para cada erro criar um case
      default:
        // default 500 error code
        super.catch(exception, host)
        break
    }
  }
}
