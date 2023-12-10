import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger, ValidationPipe } from '@nestjs/common'

import { AppModule } from './app.module'

import { ConfigService } from './shared/modules/config/service/config.service'

import { PrismaClientExceptionFilter } from './shared/modules/persistence/prisma-client-exception/prisma-client-exception.filter'

async function bootstrap() {
  const logger = new Logger('bootstrap')

  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  const port = configService.get('PORT')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  app.setGlobalPrefix('api/v1')

  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  const config = new DocumentBuilder()
    .setTitle('Catalisa Backend')
    .setDescription('Catalisa API documentation')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api/v1/docs', app, document)

  await app.listen(port)

  logger.log({ message: `Application running on port ${port}` })
}

bootstrap()
