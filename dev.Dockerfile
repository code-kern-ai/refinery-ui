FROM kernai/refinery-parent-images:v1.16.0-next

WORKDIR /app

VOLUME ["/app"]

COPY package*.json /app/

ENV NEXT_TELEMETRY_DISABLED 1
ENV IS_DEV 1

RUN npm install --also=dev

ENTRYPOINT /usr/local/bin/npm run dev