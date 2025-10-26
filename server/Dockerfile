# server/Dockerfile

FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY bun.lock .

COPY prisma ./prisma/

RUN bun install

RUN bunx prisma generate

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]