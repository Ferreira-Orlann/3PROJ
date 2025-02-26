FROM node:23-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /usr/src
RUN corepack enable
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY tsconfig.build.json tsconfig.build.json
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /usr/src/node_modules /usr/src/node_modules
COPY --from=build /usr/src/dist /usr/src/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]