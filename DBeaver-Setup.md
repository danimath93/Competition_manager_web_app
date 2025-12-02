# Connessione Database con DBeaver

## 🔗 Configurazione Connessione PostgreSQL

Per connetterti al database PostgreSQL dell'applicazione Martial Arts Competition Management con DBeaver:

### 📋 Parametri di Connessione

```
Host: localhost
Port: 5432
Database: martial_arts_db
Username: postgres
Password: password
```

### 🛠️ Passi per la Configurazione

1. **Apri DBeaver**
2. **Crea nuova connessione**:
   - Click su "New Database Connection" (icona plug)
   - Seleziona "PostgreSQL"
3. **Configura parametri**:
   - **Server Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `martial_arts_db`
   - **Username**: `postgres`
   - **Password**: `password`
4. **Testa la connessione**: Click su "Test Connection"
5. **Salva**: Click su "Finish"

### ⚠️ Prerequisiti

- I container Docker devono essere in esecuzione
- Avvia i servizi con: `docker-compose -f docker-compose.dev.yml up -d`
- Verifica che PostgreSQL sia healthy: `docker-compose -f docker-compose.dev.yml ps`

### 🗄️ Struttura Database

Una volta connesso, troverai queste tabelle:

- **`clubs`** - Palestre/associazioni
- **`atleti`** - Atleti registrati
- **`giudici`** - Giudici/arbitri
- **`competizioni`** - Gare organizzate
- **`categorie`** - Categorie di gara
- **`iscrizioni_atleti`** - Iscrizioni atleti alle categorie

### 📊 Query di Esempio

```sql
-- Lista tutti i club con numero di atleti
SELECT 
    c.nome as club,
    c.citta,
    COUNT(a.id) as numero_atleti
FROM clubs c
LEFT JOIN atleti a ON c.id = a."clubId"
GROUP BY c.id, c.nome, c.citta
ORDER BY numero_atleti DESC;

-- Atleti per categoria di peso
SELECT 
    categoria,
    COUNT(*) as numero_atleti,
    AVG(peso) as peso_medio
FROM atleti
WHERE categoria IS NOT NULL
GROUP BY categoria
ORDER BY categoria;

-- Competizioni attive
SELECT 
    nome,
    "dataInizio",
    "dataFine",
    luogo,
    stato
FROM competizioni
WHERE stato IN ('Aperta', 'In corso')
ORDER BY "dataInizio";
```

### 🔧 Risoluzione Problemi

**Connessione rifiutata**:
- Verifica che i container siano avviati: `docker ps`
- Controlla i logs: `docker-compose -f docker-compose.dev.yml logs postgres`

**Database non trovato**:
- Assicurati che il seed sia stato eseguito: `docker-compose -f docker-compose.dev.yml exec backend-dev npm run seed`

**Timeout connessione**:
- Attendi che PostgreSQL sia completamente avviato (status "healthy")
- Riavvia i container se necessario
