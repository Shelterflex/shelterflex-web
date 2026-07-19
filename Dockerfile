# Production image for shelterflex-web.
#
# Consumed by the shelterflex-platform integration stack, which pulls this
# image from GHCR rather than building from source.
#
# NOTE: NEXT_PUBLIC_* values are inlined into the client bundle at build time,
# so NEXT_PUBLIC_BACKEND_URL below is baked into the image and cannot be
# changed at runtime. The default targets the platform compose stack, where
# the browser reaches the API on the host-published port. Producing one image
# that runs against any environment requires moving the backend URL to runtime
# configuration — tracked in shelterflex-web#3.

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

ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
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
