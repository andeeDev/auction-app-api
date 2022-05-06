FROM  rabbitmq:3-management-alpine
COPY --chown=root:root rabbit-startup.sh /rabbit-startup.sh
RUN chmod +x /rabbit-startup.sh

ADD rabbitmq.config /etc/rabbitmq/
ADD definitions.json /etc/rabbitmq/
RUN chown rabbitmq:rabbitmq /etc/rabbitmq/rabbitmq.config /etc/rabbitmq/definitions.json


CMD ["rabbitmq-server"]
