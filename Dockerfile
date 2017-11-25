FROM mhart/alpine-node:latest

COPY api /api

WORKDIR /api
RUN npm install

EXPOSE 2017
CMD ["npm", "start"]