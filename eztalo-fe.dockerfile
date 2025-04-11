# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY ./frontend .
COPY ./frontend/.env ./.env

RUN npm install
RUN npm run build

# Stage 2: Run the production build with vite preview
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
