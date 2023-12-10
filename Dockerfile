# Imagem base do Node.js 18.17.1
FROM node:18.17.1-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN yarn install

# Copia o código-fonte da aplicação para o diretório de trabalho
COPY . .

# Porta em que a aplicação estará escutando
ENV PORT=${PORT}

# Porta em que o servidor da aplicação estará escutando
EXPOSE ${PORT}

# Comando para iniciar a aplicação
CMD npm run db:migrate && npm start