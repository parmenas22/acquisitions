#base stage
FROM node:20-alpine3.22 AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

#prod stage
FROM node:20-alpine3.22 AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

CMD [ "npm", "start" ]