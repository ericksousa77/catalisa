import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BankAccountManagementService } from '@src/modules/bank-accounts/domain/services/bank-account-management.service'

import {
  CreateBankAccountOutputDto,
  CreateBankAccountInputDto
} from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountController {
  constructor(
    private readonly bankAccountManagementService: BankAccountManagementService
  ) {}

  @Post() // route HTTP method definition
  @HttpCode(HttpStatus.CREATED)
  /* Swagger Doc */
  @ApiOperation({
    summary: 'Bank Account Register',
    description: 'Register a bank account on the system'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bank Account created',
    type: CreateBankAccountOutputDto
  })
  /* function */
  async createBankAccount(
    @Body() bankAccountData: CreateBankAccountInputDto
  ): Promise<CreateBankAccountOutputDto> {
    return this.bankAccountManagementService.create(bankAccountData)
  }
}
