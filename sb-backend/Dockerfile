FROM node:16

#RUN npm install pm2 -g

# Expose ports 
EXPOSE 80 1366
RUN mkdir /app
WORKDIR /app
# Bundle APP files
COPY . .

# Install app dependencies
#ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install

#CMD [ "pm2-runtime", "start", "pm2.js" ]
CMD ["node", "app.js"]
