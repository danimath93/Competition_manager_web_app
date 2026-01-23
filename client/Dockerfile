# Multi-stage build per React
# Stage 1: Build dell'applicazione
FROM node:18-alpine AS build

WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm ci --silent

# Copia il codice sorgente
COPY . .

# Build dell'applicazione per produzione
RUN npm run build

# Stage 2: Serve dell'applicazione con nginx
FROM nginx:alpine

# Copia i file buildati dallo stage precedente
COPY --from=build /app/build /usr/share/nginx/html

# Copia configurazione nginx personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Avvia nginx
CMD ["nginx", "-g", "daemon off;"]
