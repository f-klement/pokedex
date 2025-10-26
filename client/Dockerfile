# client/Dockerfile

FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install

COPY . .

#  vite port
EXPOSE 5173

CMD ["bun", "run", "dev", "--host"]