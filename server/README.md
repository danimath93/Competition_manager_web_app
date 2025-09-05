# Martial Arts Competition Management - Backend

Backend Node.js per la gestione di gare di arti marziali, sviluppato con Express.js, Sequelize e PostgreSQL.

## 🚀 Caratteristiche

- **API RESTful** per la gestione completa delle competizioni di arti marziali
- **Database PostgreSQL** con Sequelize ORM
- **Modelli relazionali** per Club, Atleti, Giudici, Competizioni e Categorie
- **Validazione dati** integrata
- **CORS** abilitato per l'integrazione frontend
- **Gestione errori** strutturata

## 📋 Prerequisiti

- Node.js (v14 o superiore)
- PostgreSQL (v12 o superiore)
- npm o yarn

## 🛠️ Installazione

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Configura le variabili d'ambiente:**
   Copia e modifica il file `.env` con le tue configurazioni:
   ```env
   DB_HOST=localhost
   DB_NAME=martial_arts_db
   DB_USER=postgres
   DB_PASSWORD=password
   DB_PORT=5432
   PORT=3050
   NODE_ENV=development
   ```

3. **Crea il database PostgreSQL:**
   ```sql
   CREATE DATABASE martial_arts_db;
   ```

## 🏃‍♂️ Avvio del Server

### Sviluppo
```bash
npm run dev
```

### Produzione
```bash
npm start
```

### Popola il database con dati di esempio
```bash
npm run seed
```

## 📊 Modelli del Database

### Club
- Informazioni del club (nome, referente, città, contatti)
- Relazioni: atleti, giudici, competizioni organizzate

### Atleta
- Dati anagrafici e sportivi
- Peso, categoria, grado
- Appartenenza al club

### Giudice
- Dati anagrafici
- Livello di esperienza (Aspirante, Regionale, Nazionale, Internazionale)
- Specializzazione e certificazioni

### Competizione
- Informazioni generali (nome, date, luogo)
- Tipologia (Kata, Kumite, Mista)
- Livello (Locale, Regionale, Nazionale, Internazionale)
- Stato (Pianificata, Aperta, In corso, Conclusa, Annullata)

### Categoria
- Criteri di partecipazione (età, peso, genere, grado)
- Tipologia (Kata o Kumite)
- Limiti di partecipanti

### Iscrizioni e Assegnamenti
- **IscrizioneAtleta**: Relazione many-to-many tra atleti e categorie
- **AssegnazioneGiudice**: Relazione many-to-many tra giudici e categorie

## 🔗 Endpoints API

### Clubs
- `GET /api/clubs` - Lista tutti i club
- `GET /api/clubs/:id` - Dettagli di un club
- `POST /api/clubs` - Crea un nuovo club
- `PUT /api/clubs/:id` - Aggiorna un club
- `DELETE /api/clubs/:id` - Elimina un club

### Competizioni
- `GET /api/competizioni` - Lista tutte le competizioni
- `GET /api/competizioni/:id` - Dettagli di una competizione
- `GET /api/competizioni/stato/:stato` - Competizioni per stato
- `POST /api/competizioni` - Crea una nuova competizione
- `PUT /api/competizioni/:id` - Aggiorna una competizione
- `DELETE /api/competizioni/:id` - Elimina una competizione

### Health Check
- `GET /api/health` - Verifica stato server e database

## 🔧 Sviluppo

### Script Disponibili
- `npm run dev` - Avvia il server in modalità sviluppo (con nodemon)
- `npm start` - Avvia il server in modalità produzione
- `npm run seed` - Popola il database con dati di esempio

### Struttura del Progetto
```
server/
├── config/          # Configurazioni database
├── controllers/     # Logica di business
├── models/         # Modelli Sequelize
├── routes/         # Route definizioni
├── migrations/     # Migrazioni database (future)
├── .env           # Variabili d'ambiente
├── index.js       # Entry point
└── seedDatabase.js # Script per popolare il DB
```

## 🧪 Test dell'API

Dopo aver avviato il server, puoi testare l'API utilizzando:

1. **Browser**: Visita `http://localhost:3050/api`
2. **Postman/Insomnia**: Importa le chiamate API
3. **curl**: Esempi di chiamate

### Esempio con curl:
```bash
# Health check
curl http://localhost:3050/api/health

# Lista club
curl http://localhost:3050/api/clubs

# Crea un nuovo club
curl -X POST http://localhost:3050/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nuovo Dojo",
    "referente": "Mario Rossi",
    "citta": "Milano",
    "telefono": "02-1234567"
  }'
```

## 🚧 Prossimi Sviluppi

- [ ] Controller e routes per Atleti
- [ ] Controller e routes per Giudici  
- [ ] Controller e routes per Categorie
- [ ] Sistema di autenticazione JWT
- [ ] Upload file (documenti, foto)
- [ ] Sistema di notifiche
- [ ] Report e statistiche
- [ ] API per la gestione dei risultati
- [ ] WebSocket per aggiornamenti real-time

## 📝 Note

- Il database viene sincronizzato automaticamente all'avvio
- I modelli utilizzano validazioni Sequelize per garantire l'integrità dei dati
- Le relazioni tra modelli sono configurate per mantenere la coerenza referenziale
