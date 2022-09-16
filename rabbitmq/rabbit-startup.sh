#!/bin/sh

set -e

rabbitmqctl add_user andee guest
rabbitmqctl set_user_tags andee administrator

rabbitmqctl add_vhost notification
rabbitmqctl set_permissions -p notification andee .\* .\* .\*

rabbitmq-server