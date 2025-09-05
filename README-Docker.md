# 🥋 Martial Arts Competition Management

Sistema completo per la gestione di competizioni di arti marziali con backend Node.js, frontend React e database PostgreSQL, tutto containerizzato con Docker.

## 🏗️ Architettura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + Nginx │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Port: 80/3000 │    │   Port: 3050    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisiti
- Docker Desktop installato
- Docker Compose
- Git

### Avvio Rapido (Sviluppo)

```bash
# Clona il repository
git clone <repository-url>
cd martial-arts-competition

# Avvia tutti i servizi in modalità sviluppo
docker-compose -f docker-compose.dev.yml up -d

# Popola il database con dati di esempio
docker-compose -f docker-compose.dev.yml exec backend-dev npm run seed
```

### Accesso ai Servizi

- **Frontend**: http://localhost:3000 (dev) / http://localhost (prod)
- **Backend API**: http://localhost:3050
- **Database**: localhost:5432 (per connessione diretta con DBeaver o altri client)

## 📋 Comandi Docker

### Sviluppo

```bash
# Avvia tutto in modalità sviluppo (con hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Visualizza i logs
docker-compose -f docker-compose.dev.yml logs -f

# Ferma tutti i servizi
docker-compose -f docker-compose.dev.yml down

# Rebuild completo
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Produzione

```bash
# Avvia in modalità produzione
docker-compose up -d

# Visualizza i logs
docker-compose logs -f

# Ferma tutti i servizi
docker-compose down
```

### Makefile (Comandi Semplificati)

Se hai `make` installato, puoi usare questi comandi:

```bash
# Sviluppo
make dev-up        # Avvia sviluppo
make dev-logs      # Visualizza logs
make dev-down      # Ferma sviluppo
make dev-rebuild   # Rebuild completo

# Produzione
make up            # Avvia produzione
make logs          # Visualizza logs
make down          # Ferma produzione
make rebuild       # Rebuild completo

# Database
make db-seed       # Popola il database
make db-backup     # Backup del database

# Utility
make clean         # Pulisce tutto
make help          # Mostra tutti i comandi
```

## 🗄️ Database

### Configurazione PostgreSQL

- **Host**: `postgres` (interno) / `localhost` (esterno)
- **Port**: `5432`
- **Database**: `martial_arts_db`
- **Username**: `postgres`
- **Password**: `password`

### Connessione Database con DBeaver

Per connetterti al database PostgreSQL con DBeaver:

1. **Crea una nuova connessione PostgreSQL**
2. **Configura i parametri**:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `martial_arts_db`
   - **Username**: `postgres`
   - **Password**: `password`
3. **Testa la connessione** e salva

**Nota**: Assicurati che i container Docker siano in esecuzione prima di connetterti.

### Seed Database

```bash
# Popola il database con dati di esempio
docker-compose -f docker-compose.dev.yml exec backend-dev npm run seed
```

## 🔧 Configurazione Ambiente

### Variabili d'Ambiente

Il backend utilizza queste variabili d'ambiente (configurate automaticamente in Docker):

```env
NODE_ENV=development/production
DB_HOST=postgres
DB_NAME=martial_arts_db
DB_USER=postgres
DB_PASSWORD=password
DB_PORT=5432
PORT=3050
```

### Personalizzazione

Per personalizzare la configurazione:

1. **Database**: Modifica le variabili environment nei file docker-compose
2. **Backend**: Modifica `server/.env` per esecuzione locale
3. **Frontend**: Aggiungi variabili REACT_APP_ in docker-compose.dev.yml

## 📁 Struttura del Progetto

```
martial-arts-competition/
├── client/                 # Frontend React
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── server/                 # Backend Node.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── Dockerfile
│   └── Dockerfile.dev
├── database/              # Script inizializzazione DB
│   └── init/
├── docker-compose.yml     # Produzione
├── docker-compose.dev.yml # Sviluppo
└── Makefile              # Comandi semplificati
```

## 🚧 Sviluppo

### Hot Reload

In modalità sviluppo (`docker-compose.dev.yml`):

- **Frontend**: Hot reload automatico per modifiche React
- **Backend**: Nodemon riavvia automaticamente il server
- **Database**: Persistenza dati tra riavvii

### Debug

```bash
# Accedi al container backend
docker-compose -f docker-compose.dev.yml exec backend-dev sh

# Accedi al container frontend
docker-compose -f docker-compose.dev.yml exec frontend-dev sh

# Visualizza logs specifici
docker-compose -f docker-compose.dev.yml logs backend-dev
docker-compose -f docker-compose.dev.yml logs frontend-dev
```

## 🛠️ Troubleshooting

### Problemi Comuni

1. **Porta già in uso**
   ```bash
   # Cambia le porte nei file docker-compose
   ports:
     - "3001:3000"  # invece di 3000:3000
   ```

2. **Database non si connette**
   ```bash
   # Verifica che PostgreSQL sia avviato
   docker-compose -f docker-compose.dev.yml logs postgres
   
   # Riavvia solo il database
   docker-compose -f docker-compose.dev.yml restart postgres
   ```

3. **Pulizia completa**
   ```bash
   # Ferma tutto e pulisce volumi
   docker-compose -f docker-compose.dev.yml down -v
   docker system prune -a
   ```

### Logs e Monitoraggio

```bash
# Logs di tutti i servizi
docker-compose -f docker-compose.dev.yml logs -f

# Logs di un servizio specifico
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Stato dei container
docker-compose -f docker-compose.dev.yml ps
```

## 📚 API Documentation

Una volta avviato il backend, la documentazione API è disponibile su:
- **API Base**: http://localhost:3050/api
- **Health Check**: http://localhost:3050/api/health

### Endpoints Principali

- `GET /api/clubs` - Lista club
- `GET /api/competizioni` - Lista competizioni
- `POST /api/clubs` - Crea nuovo club
- `POST /api/competizioni` - Crea nuova competizione

## 🚀 Deployment

Per il deployment in produzione:

1. **Build delle immagini**:
   ```bash
   docker-compose build
   ```

2. **Avvio in produzione**:
   ```bash
   docker-compose up -d
   ```

3. **Configurazione reverse proxy** (nginx/Apache) per dominio personalizzato

4. **SSL/TLS** con Let's Encrypt o certificati personalizzati

## 📄 Licenza

[Inserire licenza appropriata]
