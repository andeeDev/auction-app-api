FROM node:18-slim AS development

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install glob rimraf

RUN npm install --only=development


COPY . .

CMD ["./migrate.sh"]

RUN npm run build
