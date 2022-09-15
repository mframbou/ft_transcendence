
all: dev

prod: down
	docker-compose -f docker-compose.yml up

dev: down
	docker-compose -f docker-compose.dev.yml up --remove-orphans

down:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.dev.yml down
