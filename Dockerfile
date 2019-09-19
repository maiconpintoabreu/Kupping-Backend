FROM node:10-alpine
RUN mkdir /opt/backend-kupping
WORKDIR /opt/backend-kupping
COPY package.json /opt/backend-kupping/
RUN npm install
EXPOSE 80
COPY . /opt/backend-kupping

CMD ["npm","run-script","run"]
