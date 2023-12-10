import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Delete,
  Get
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
import {
  DeactivateBankAccountOutputDto,
  DeactivateBankAccountParamInputDto
} from '../dtos/bank-account/deactive-bank-account-dto'
import {
  ShowBankAccountOutputDto,
  ShowBankAccountParamInputDto
} from '../dtos/bank-account/show-bank-account-dto'

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
    return this.bankAccountManagementService.createBankAccount(bankAccountData)
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
    type: UpdateBankAccountOutputDto
  })
  /* function */
  async updateBankAccount(
    @Param() params: UpdateBankAccountParamInputDto,
    @Body() bankAccountData: UpdateBankAccountInputDto
  ): Promise<UpdateBankAccountOutputDto> {
    return this.bankAccountManagementService.updateBankAccount(
      params.bankAccountId,
      bankAccountData
    )
  }

  @Delete(':bankAccountId') // route HTTP method definition
  @HttpCode(HttpStatus.OK)
  /* Swagger Doc */
  @ApiOperation({
    summary: 'Bank Account Deactivate',
    description: 'Update bank account to inactive'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank Account update to inactived',
    type: DeactivateBankAccountOutputDto
  })
  /* function */
  async deactivateBankAccount(
    @Param() params: DeactivateBankAccountParamInputDto
  ): Promise<DeactivateBankAccountOutputDto> {
    return this.bankAccountManagementService.deactivateBankAccount(
      params.bankAccountId
    )
  }

  @Get(':bankAccountId') // route HTTP method definition
  @HttpCode(HttpStatus.OK)
  /* Swagger Doc */
  @ApiOperation({
    summary: 'Bank Account Show',
    description: 'Find one bank account by ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank Account found by id',
    type: ShowBankAccountOutputDto
  })
  /* function */
  async findOneBankAccount(
    @Param() params: ShowBankAccountParamInputDto
  ): Promise<ShowBankAccountOutputDto> {
    return this.bankAccountManagementService.findOneBankAccount(
      params.bankAccountId
    )
  }
}
