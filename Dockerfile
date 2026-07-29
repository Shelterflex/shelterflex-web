# Production image for shelterflex-web.
#
# Consumed by the shelterflex-platform integration stack, which pulls this
# image from GHCR rather than building from source.
#
# NOTE: The backend URL is provided to the running server at runtime via
# `BACKEND_URL` (or `NEXT_PUBLIC_BACKEND_URL` for local dev). This image no
# longer bakes a backend URL at build time, so the same image can be pointed
# at different backends without rebuilding.

FROM node:20-alpine AS deps
WORKDIR /app
# scripts/ is needed here, not just in the build stage: the preinstall hook
# (scripts/ensure-npm.mjs) runs during `npm ci`, before the rest of the
# source is copied in.
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S -u 1001 -G nodejs nextjs

# `output: "standalone"` puts the traced server and its dependencies in
# .next/standalone; public/ and .next/static are not traced and are copied in.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
