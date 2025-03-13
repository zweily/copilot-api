FROM oven/bun:slim

WORKDIR /app

COPY package*.json ./

RUN bun install

COPY src ./src
COPY tsconfig.json ./

EXPOSE 4141

ENV NODE_ENV=production

CMD ["bun", "run", "start"]