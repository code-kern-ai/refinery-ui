ARG PARENT_IMAGE=kernai/refinery-parent-images:v1.27.0-next
ARG RUNTIME_PARENT_IMAGE=${PARENT_IMAGE}

FROM ${PARENT_IMAGE} AS builder

WORKDIR /app

USER root

COPY package*.json ./
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install && npm cache clean --force

COPY src ./src
COPY public ./public
COPY submodules ./submodules
COPY next.config.js .
COPY tsconfig.json .
COPY postcss.config.js .
COPY tailwind.config.js .

RUN npm run build

FROM ${RUNTIME_PARENT_IMAGE}

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/public ./public
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static

USER 65532:65532

ENTRYPOINT ["node", "server.js"]