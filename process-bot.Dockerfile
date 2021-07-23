FROM node:16-alpine AS deps

RUN apk add --no-cache libc6-compat git

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

###
FROM node:16-alpine AS builder

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

CMD ["yarn", "ts-node", "scripts/process-bot"]

