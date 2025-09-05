# Dockerfile per il backend Node.js
FROM node:18-alpine

# Crea la directory dell'app
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Espone la porta 3050
EXPOSE 3050

# Crea un utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Cambia ownership dei file
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Comando per avviare l'applicazione
CMD ["npm", "start"]
