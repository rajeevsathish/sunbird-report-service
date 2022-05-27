FROM node:8.11-alpine
RUN apk update \
    && mkdir -p /opt/report
COPY . /opt/report/
WORKDIR /opt/report/
RUN npm install
CMD ["npm", "run", "start", "&"]
