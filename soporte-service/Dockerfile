# Tickets (Support) Service Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3005
EXPOSE 3005

CMD ["node", "index.js"]
