# Install dependencies only when needed
FROM node:alpine
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/client/package.json ./packages/client/
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/
COPY packages/infra/package.json ./packages/infra/
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001
USER api

EXPOSE 3330

ENV PORT 3330

WORKDIR /app/apps/api

CMD ["yarn", "start"]
