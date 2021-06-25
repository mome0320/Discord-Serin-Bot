FROM node

RUN mkdir -p /app
WORKDIR /app
ADD . /app

RUN yarn

ENV PATH="/app/node_modules/ffmpeg-static/bin/linux/x64:${PATH}"

ENTRYPOINT [ "yarn", "start" ]