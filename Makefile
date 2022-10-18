
all: dev

#prod: down
#	docker-compose -f docker-compose.yml up --force-recreate --build

dev: down
	docker-compose -f docker-compose.dev.yml up --remove-orphans --force-recreate --build

down:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.dev.yml down
