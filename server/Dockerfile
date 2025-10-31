# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm i --prod=false
COPY . .
# compile TS to JS (expects tsconfig with "outDir": "dist")
RUN pnpm tsc -p tsconfig.json --pretty false

# change this to your compiled server entry (was index.js)
CMD ["node", "dist/server.js"]
EXPOSE 3000
