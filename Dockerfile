FROM node:14.18.1-slim
RUN apk update \
    && mkdir -p /opt/report
COPY . /opt/report/
WORKDIR /opt/report/
RUN npm install
CMD ["npm", "run", "start", "&"]
