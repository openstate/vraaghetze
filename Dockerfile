FROM node:24-alpine AS builder
WORKDIR /opt/vraaghetze
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

FROM node:24-alpine
WORKDIR /opt/vraaghetze
COPY --from=builder /opt/vraaghetze/build ./build
COPY --from=builder /opt/vraaghetze/node_modules ./node_modules
COPY --from=builder /opt/vraaghetze/package.json ./
CMD [ "node", "build" ]
