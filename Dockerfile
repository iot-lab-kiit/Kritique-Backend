FROM node:21-alpine3.18
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
CMD ["yarn", "start"]
