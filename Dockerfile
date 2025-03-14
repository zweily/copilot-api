FROM oven/bun:1.2.5 AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production


FROM base AS prerelease
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun test
RUN bun run build

FROM base AS release
COPY --from=install /usr/src/app/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist/ .

USER bun
EXPOSE 4141/tcp
ENTRYPOINT [ "bun", "main.js"]