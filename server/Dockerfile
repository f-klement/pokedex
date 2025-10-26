# server/Dockerfile

FROM oven/bun:latest

WORKDIR /app

RUN apt-get update && apt-get install -y openssl postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY bun.lock bunfig.toml ./
COPY prisma ./prisma/

RUN bun install

ARG DATABASE_URL_BUILD
ENV DATABASE_URL=${DATABASE_URL_BUILD}

RUN bunx prisma generate

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

EXPOSE 3000

CMD ["bun", "run", "dev"]