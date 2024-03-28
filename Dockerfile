FROM node:14.18.1-slim
RUN mkdir -p /opt/report
COPY . /opt/report/
WORKDIR /opt/report/
RUN npm install
CMD ["npm", "run", "start", "&"]
