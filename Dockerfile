FROM node:18

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 7007

CMD ["npm" , "start"]