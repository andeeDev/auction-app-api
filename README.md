## User Service

App responsible for creating users and create user, auth, changes password.
Docker-compose.yml file set up all containers

## Running the app

To set up the app create env file
```dotenv
NODE_ENV=dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=crudjs
POSTGRES_DB=mydb

DATABASE_URL="postgresql://postgres:crudjs@postgres:5432/postgres"

RABBIT_MQ_USER=andee
RABBIT_MQ_PASSWORD=guest
RABBIT_MQ_HOST=rabbitmq
RABBIT_MQ_VHOST=notifications
RABBIT_MQ_PORT=5672
```
Then start the containers

```bash
 docker-compose up -d
```

