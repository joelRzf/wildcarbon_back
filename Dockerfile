FROM node:lts-alpine
 
RUN apk --no-cache add curl
RUN apk add make g++ python3 git
RUN npm i -g node-pre-gyp

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY tsconfig.json ./
 
COPY src ./src
 
CMD npm start