# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile
COPY . .
# compile TS to JS (expects tsconfig with "outDir": "dist")
RUN pnpm tsc -p tsconfig.json --pretty false

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm i --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
# change this to your compiled server entry (was index.js)
CMD ["node", "dist/server.js"]
EXPOSE 3000
