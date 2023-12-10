import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@src/shared/modules/config/config.module'
import { UndefinedEnvironmentException } from '@src/shared/modules/config/exception/config.exception'
import { ConfigService } from '@src/shared/modules/config/service/config.service'

const getConfigService = async (): Promise<ConfigService> => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot()]
  }).compile()

  return module.get<ConfigService>(ConfigService)
}

describe('ConfigModule', () => {
  it('does not throw UndefinedEnvironmentException when given envFilePath', () => {
    expect(() => {
      ConfigModule.forRoot()
    }).not.toThrow(UndefinedEnvironmentException)
  })

  it('parses environment variables', async () => {
    const service = await getConfigService()

    expect(service.get('PORT')).toEqual(3334)
  })
})
