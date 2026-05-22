ARG PARENT_IMAGE=registry.dev.kern.ai/code-kern-ai/refinery-parent-images:dev-next

FROM ${PARENT_IMAGE} AS builder

WORKDIR /app

USER root

COPY package*.json ./
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

FROM ${PARENT_IMAGE}

WORKDIR /app

COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/public ./public
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static

USER 65532:65532

ENTRYPOINT ["node", "server.js"]