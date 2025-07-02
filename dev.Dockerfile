FROM node:18

WORKDIR /app

VOLUME ["/app"]

COPY package*.json /app/

ENV NEXT_TELEMETRY_DISABLED=1
ENV IS_DEV=1
ENV WATCHPACK_POLLING=true

RUN npm install --include=dev

ENTRYPOINT ["/usr/local/bin/npm", "run", "dev"]