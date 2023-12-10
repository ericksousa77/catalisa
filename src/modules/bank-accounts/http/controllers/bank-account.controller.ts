import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BankAccountManagementService } from '@src/modules/bank-accounts/domain/services/bank-account-management.service'

import {
  CreateBankAccountOutputDto,
  CreateBankAccountInputDto
} from '@src/modules/bank-accounts/http/dtos/bank-account/create-bank-account-dto'
import {
  UpdateBankAccountInputDto,
  UpdateBankAccountOutputDto,
  UpdateBankAccountParamInputDto
} from '../dtos/bank-account/update-bank-account-dto'

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

  @Put(':bankAccountId') // route HTTP method definition
  @HttpCode(HttpStatus.OK)
  /* Swagger Doc */
  @ApiOperation({
    summary: 'Bank Account Update',
    description: 'Update a bank account on the system'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank Account updated',
    type: CreateBankAccountOutputDto
  })
  /* function */
  async updateBankAccount(
    @Param() params: UpdateBankAccountParamInputDto,
    @Body() bankAccountData: UpdateBankAccountInputDto
  ): Promise<UpdateBankAccountOutputDto> {
    return this.bankAccountManagementService.update(
      params.bankAccountId,
      bankAccountData
    )
  }
}
