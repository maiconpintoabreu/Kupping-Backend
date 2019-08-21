FROM node:10-alpine
RUN mkdir /opt/backend-kupping
COPY . /opt/backend-kupping
WORKDIR /opt/backend-kupping

EXPOSE 80

CMD ["npm","run-script","run"]
