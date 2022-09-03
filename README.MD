# Transcendendwish

BelloPongo

# Why ?

This project is the last one part of the common core at [42](https://42.fr):
- The goal is simple: create a **real-time** online pong game featuring **oauth**, **2FA**, **chat** and **friends management**, a **matchmaking and ranking system** with any typescript framework for the frontend, [NestJS](https://nestjs.com) for the backend, and [Postgres](https://www.postgresql.org) for the database. All running in separate docker containers
<br>
<br>
But it's not that easy, because it's **the first time experiencing web development, which means learning new languages, frameworks and technologies** .

# Running the app

You first need to create a `.env` file at the root of the repository with the following:


```shell
# AUTH
API42_CLIENT_SECRET=your_42_client_secret
API42_CLIENT_ID=your_42_client_id
JWT_SECRET=your_long_jwt_secret

# DATABASE
POSTGRES_USER=transcendence
POSTGRES_PASSWORD=transcendence
POSTGRES_DB=transcendence
POSTGRES_HOST=database # specified in docker-compose

# For CORS, since front/back are on different ports, if allowing credentials CORS-Origin cannot be *
SERVER_NAME=localhost

# postgres://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}
```

You need [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/overview/) to run the app.

```bash
# Production build
$ docker-compose up

# Development mode
$ docker-compose -f docker-compose.dev.yml up
```

You can then access the app on `localhost` at port `3001`.
    
```bash
http://127.0.0.1:3001
```

# Specifications

This app uses:
- [SvelteKit](https://kit.svelte.dev) to build the frontend
- [NestJS](https://nestjs.com) with [Prisma](https://prisma.io) to build the backend
- [Postgres](https://www.postgresql.org) to store the data

# Using the app

It is very simple to use the app, simply press the `Login with 42` button and you will be redirected to the 42 login page.

*We might add dummy logins in the future for those who don't have access to the 42 Intra.*

# Contributors

- [dsamain](https://github.com/dsamain)
- [oronda](https://github.com/Oronda42)
- [sspina](https://github.com/SalvatoreSpina)
- [mframbou](https://github.com/Zekoyu)