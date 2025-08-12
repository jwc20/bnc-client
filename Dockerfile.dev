FROM node:23.6.0-alpine3.21 AS build

WORKDIR /app

COPY package.json ./

RUN yarn install

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN yarn run build

FROM nginx:1.27.5-alpine3.21

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 5173

ENTRYPOINT ["nginx","-g","daemon off;"]