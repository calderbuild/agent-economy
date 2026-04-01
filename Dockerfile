FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 4021
ENV PORT=4021
CMD ["npx", "tsx", "src/server/index.ts"]
