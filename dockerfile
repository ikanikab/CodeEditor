# Build the frontend [dist folder]
# Copy the dist folder content in backend/public folder

FROM node:20-alpine AS frontend-builder

COPY ./frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

#Build backend
FROM node:20-alpine

COPY ./backend /app

WORKDIR /app

RUN npm install --omit=dev

COPY --from=frontend-builder /app/dist /app/public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
