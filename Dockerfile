FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 3000 9229
CMD ["npm","run","start:prod"]
