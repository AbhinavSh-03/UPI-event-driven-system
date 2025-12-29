FROM node:20-alpine

WORKDIR /app

# copy root package.json
COPY api-gateway/package*.json ./
RUN npm install

# copy all source code
COPY api-gateway ./api-gateway
COPY command-service ./command-service
COPY query-service ./query-service
COPY event-consumers ./event-consumers
COPY shared ./shared

WORKDIR /app/api-gateway

CMD ["npm", "run", "dev"]
