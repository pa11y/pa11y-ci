ARG BASE_IMAGE=node:20-alpine
FROM $BASE_IMAGE

# Install Chromium
RUN apk add --no-cache \
	chromium

# Install Chromium's dependencies
RUN apk add --no-cache \
	ca-certificates \
	freetype \
	harfbuzz \
	nss \
	ttf-freefont

# Switch user from 'root' to 'node' (inherited from node:alpine)
USER node

# Let's install global dependencies somewhere visitable by user 'node'
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Avoid downloading Chromium again
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Pa11y CI and our config into the container
RUN npm install --global pa11y-ci
# COPY ./config.json /usr/config.json

ENTRYPOINT ["pa11y-ci", "--config", "/usr/config.json"]
