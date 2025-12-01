# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile
COPY . .
# Set API URL as build arg - defaults to /api for production
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# --- runtime stage ---
FROM nginx:alpine
# SPA fallback & static caching
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
