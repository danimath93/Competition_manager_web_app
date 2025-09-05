#!/bin/bash
set -e

# Script di inizializzazione per PostgreSQL
# Questo script viene eseguito quando il container PostgreSQL viene avviato per la prima volta

echo "Inizializzazione database martial_arts_db..."

# Il database viene già creato tramite POSTGRES_DB
# Qui possiamo aggiungere eventuali configurazioni aggiuntive

# Crea estensioni se necessarie
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Abilita l'estensione UUID se necessaria in futuro
    -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Crea indici aggiuntivi se necessari
    -- Questi verranno creati automaticamente da Sequelize
    
    -- Log di inizializzazione completata
    SELECT 'Database martial_arts_db inizializzato correttamente' AS status;
EOSQL

echo "Inizializzazione database completata!"
