FROM node:21-alpine3.18
WORKDIR /app
COPY . .
RUN yarn install
COPY . .
CMD ["yarn", "start"]
