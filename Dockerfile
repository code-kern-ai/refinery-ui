FROM node:18-alpine as build
# should use base image

WORKDIR /app
COPY package*.json /app/
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install
COPY . /app
RUN npm run build

ENTRYPOINT /usr/local/bin/npm run start