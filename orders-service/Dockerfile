# Sales (Orders) Service Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
# We'll run the service on 3004 inside the container as requested
ENV PORT=3004
EXPOSE 3004

CMD ["node", "index.js"]


