# catalisa

## Stack de tecnologia do backend:

* Nodejs (18.17.1)
* Postgres (15-alpine)
* Prisma 5.5.2
* Nest 9.0.0
* Docker
* Docker compose

## Diagrama do Banco de Dados (SQL)

<p align="center">
  <img src="database-diagram-catalisa.png" alt="Diagrama Banco de Dados">
</p>

## Definição das variáveis de ambiente:

Na raiz do projeto deve existir um arquivo **.env** definindo os valores para as variaveis de ambiente do projeto. A titulo de facilitar a execução do projeto, deixei um exemplo no arquivo **.env.default** que esta na raiz do projeto. Sendo assim basta copiar o conteudo desse arquivo e colocar no arquivo **.env**.

OBS: 

Caso queria executar o projeto apontando para um banco localhost, a **DATABASE_URL** dentro do arquivo **.env**  deve seguir esse padrão:

```
DATABASE_URL='postgres://postgres:postgres@localhost:5432/catalisa?schema=public'
```
Caso queria executar com docker, a **DATABASE_URL** dentro do arquivo **.env**  deve seguir esse padrão:

```
DATABASE_URL='postgres://postgres:postgres@catalisa-db:5432/catalisa?schema=public'
```

## Execução do projeto:

Após configurar o arquivo **.env** basta acessar o diretório do projeto e executar o comando:

`docker compose up --build -d`

Após executar esse comando o backend estará sendo executado em:

`http://localhost:3333/api/v1`

OBS: caso tenha optado por outra porta no arquivo **.env** lembre-se de mudar aqui e nas demais requests

Exemplo de request: 

`Método GET - http://localhost:3333/api/v1/bank-accounts`

*Outra alternativa para executar o projeto é executa-lo fora do container, nesse caso basta utilizar o comando:

`yarn start:dev`

Após executar esse comando o backend também estará sendo executado em:

`http://localhost:3333/api/v1`

## Documentação do projeto:

Toda documentação do projeto foi feita utilizando swagger. Para acessa-la basta que o projeto esteja rodando:

Url para documentação: 

`Método GET - http://localhost:3333/api/v1/docs`

## Execução dos testes automatizados:

Para executar os testes :

Crie o arquivo **.env.test** na raiz do projeto, a titulo de exemplo esse foi o é o meu arquivo: 

```
NODE_ENV=test

PORT=3334

DATABASE_URL='postgres://postgres:postgres@localhost:5432/catalisa-test?schema=public' 

```

Para executar os testes unitários use o comando:

`yarn test:unit`

Para executar os testes e2e use o comando:

`yarn test:e2e`

Para executar todos os testes de uma vez:

`yarn test`

## Features do projeto:
- [x] - CRUD conta bancária.
- [x] - Testes unitários para todas funções.
- [x] - Testes E2E para todos endpoints.
- [x] - Soft delete para contas bancárias. [optei por isso para não perder o historico de transações de uma conta bancaria deletada]
- [x] - Contas bancárias desativadas não podem realizar deposito ou saque.
- [x] - Adição de validações para saques e depositos;
- [x] - Documentação de todos endpoints no swagger.
- [x] - Versionamento utilizando GIT Flow.

