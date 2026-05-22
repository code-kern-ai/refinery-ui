ARG PARENT_IMAGE=registry.dev.kern.ai/code-kern-ai/refinery-parent-images:dev-next
FROM ${PARENT_IMAGE}

WORKDIR /app

USER root

COPY package*.json /app/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install
COPY . /app
RUN npm run build

USER 65532:65532

ENTRYPOINT ["/usr/local/bin/npm", "run", "start"]
