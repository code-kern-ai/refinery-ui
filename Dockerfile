FROM kernai/refinery-parent-images:v1.19.0-next

WORKDIR /app
COPY package*.json /app/
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install
COPY . /app
RUN npm run build

ENTRYPOINT /usr/local/bin/npm run start