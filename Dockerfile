FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate

FROM nginx:alpine
# Nuxt 4 emits the static site to .output/public (Nuxt 2 used ./public).
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
