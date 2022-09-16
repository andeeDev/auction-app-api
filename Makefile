DOCKER_CONTAINER_NAME = nestjs_api

start:
	docker-compose up -d
	# docker logs ${DOCKER_CONTAINER_NAME} -f

stop:
	docker-compose stop

down:
	docker-compose down

logs:
	docker logs ${DOCKER_CONTAINER_NAME} -f