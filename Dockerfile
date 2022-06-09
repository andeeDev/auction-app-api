FROM node:18.1.0-alpine3.14 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .


RUN npm run build

CMD [  "npm", "run", "start:migrate" ]


FROM node:18.1.0-alpine3.14 as production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

#EXPOSE 9000
# 👇 new migrate and start app script
CMD [ "node", "dist/main" ]
#CMD [  "npm", "run", "start:dev" ]