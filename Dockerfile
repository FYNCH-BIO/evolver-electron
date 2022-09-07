FROM node:12.22-buster-slim as gui

RUN apt-get update && apt-get install -y libgtk-3-0 libx11-xcb1 libxss1 libgconf-2-4 libnss3 libasound2 

WORKDIR /app
COPY . .
RUN yarn --network-timeout 100000 

EXPOSE 1212
CMD ["yarn","dev"]
