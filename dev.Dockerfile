FROM node:18-alpine 
# should use base image


WORKDIR /app

VOLUME ["/app"]

COPY package*.json /app/

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install --also=dev

ENTRYPOINT /usr/local/bin/npm run dev