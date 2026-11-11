// Carica .env prima dei modelli (config/database legge le variabili al require)
require('dotenv').config({ quiet: true });

const { 
  Club, 
  Atleta, 
  Giudice, 
  Competizione, 
  Categoria, 
  IscrizioneAtleta,
  UtentiLogin,
  AgeGroupConfiguration,
  sequelize 
} = require('./models');

// Fasce d'età standard usate dalle configurazioni di default
const DEFAULT_AGE_GROUPS = [
  { key: 'pulcini', label: 'Pulcini', grouping: 'children', order: 1, minAge: 5, maxAge: 7 },
  { key: 'bambini', label: 'Bambini', grouping: 'children', order: 2, minAge: 8, maxAge: 9 },
  { key: 'esordienti', label: 'Esordienti', grouping: 'children', order: 3, minAge: 10, maxAge: 12 },
  { key: 'cadetti', label: 'Cadetti', grouping: 'adults', order: 4, minAge: 13, maxAge: 15 },
  { key: 'junior', label: 'Junior', grouping: 'adults', order: 5, minAge: 16, maxAge: 18 },
  { key: 'seniores', label: 'Seniores', grouping: 'adults', order: 6, minAge: 19, maxAge: 40 },
  { key: 'masters-a', label: 'MastersA', grouping: 'adults', order: 7, minAge: 41, maxAge: 50 },
  { key: 'masters-b', label: 'MastersB', grouping: 'adults', order: 8, minAge: 51, maxAge: null }
];

// Allineato a scripts/seed_age_group_configurations.sql
const DEFAULT_AGE_GROUP_CONFIGURATIONS = [
  {
    name: 'Età sportiva',
    description: 'Età compiuta entro il 31/12 dell\'anno della gara',
    config: { version: 1, mode: 'seasonAge', seasonStart: '01-01', groups: DEFAULT_AGE_GROUPS }
  },
  {
    name: 'Età a inizio gara',
    description: 'Età esatta alla data di inizio gara',
    config: { version: 1, mode: 'age', groups: DEFAULT_AGE_GROUPS }
  }
];

// Crea le configurazioni di default mancanti e riallinea quelle esistenti (rieseguibile, ricerca per nome)
const seedAgeGroupConfigurations = async () => {
  let created = 0;
  for (const { name, description, config } of DEFAULT_AGE_GROUP_CONFIGURATIONS) {
    const [configuration, isNew] = await AgeGroupConfiguration.findOrCreate({
      where: { clubId: null, name },
      defaults: { description, config }
    });
    if (isNew) {
      created++;
    } else {
      await configuration.update({ description, config });
    }
  }
  console.log(`✅ Configurazioni fasce età di default: ${created} create, ${DEFAULT_AGE_GROUP_CONFIGURATIONS.length - created} aggiornate`);
};

const seedData = async () => {
  try {
    // Forza la sincronizzazione del database (ricrea le tabelle)
    await sequelize.sync({ force: true });
    console.log('🗄️  Database sincronizzato');

    // Seed Configurazioni
    const configTipiCompetizione = await sequelize.models.ConfigTipoCompetizione.bulkCreate([
      { id: 1, nome: 'Quyen', descrizione: 'Competizione di Quyen a mani nude e con armi' },
      { id: 3, nome: 'Combattimenti', descrizione: 'Competizione di combattimenti marziali' },
      { id: 4, nome: 'Attività complementari', descrizione: 'Attività ludiche o di esibizione' },
    ]);

    const configTipiCategoria = await sequelize.models.ConfigTipoCategoria.bulkCreate([
      { nome: 'Quyen programma', descrizione: 'Categoria per Quyen a mani nude o con armi', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen internazionale', descrizione: 'Categoria per Quyen secondo regolamenti internazionali', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen mani nude a squadre', descrizione: 'Categoria per Quyen a mani nude in squadre', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Song luyen mani nude', descrizione: 'Categoria per Song Luyen a mani nude', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi lunghe', descrizione: 'Categoria per Quyen con armi lunghe', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi corte', descrizione: 'Categoria per Quyen con armi corte', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi snodate', descrizione: 'Categoria per Quyen con armi snodate', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi a squadre', descrizione: 'Categoria per Quyen con armi in squadre', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Song luyen con armi', descrizione: 'Categoria per Song Luyen con armi', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Light contact', descrizione: 'Categoria per combattimenti di light contact', tipoCompetizioneId: 3, idConfigTipiAtleti: [1,2,3], obbligoPeso: true },
      { nome: 'Lotta tradizionale', descrizione: 'Categoria per combattimenti di lotta tradizionale vietnamita vat', tipoCompetizioneId: 3, idConfigTipiAtleti: [2,3], obbligoPeso: false },
      { nome: 'Fighting ball', descrizione: 'Categoria per combattimenti fighting ball per bambini', tipoCompetizioneId: 3, idConfigTipiAtleti: [1], obbligoPeso: true },
      { nome: 'Festa di Natale', descrizione: 'Categoria per attività ludiche per bambini', tipoCompetizioneId: 4, idConfigTipiAtleti: [1], obbligoPeso: false }
    ]);

    const configGruppiEta = await sequelize.models.ConfigGruppoEta.bulkCreate([
      { nome: 'Pulcini', etaMinima: 4, etaMassima: 6, inizioValidita: '2018-01-01', fineValidita: '2022-12-31', descrizione: 'Bambini dai 4 ai 6 anni' },
      { nome: 'Bambini', etaMinima: 7, etaMassima: 8, inizioValidita: '2016-01-01', fineValidita: '2017-12-31', descrizione: 'Bambini dai 7 ai 8 anni' },
      { nome: 'Esordienti', etaMinima: 9, etaMassima: 11, inizioValidita: '2013-01-01', fineValidita: '2015-12-31', descrizione: 'Bambini dagli 9 agli 11 anni' },
      { nome: 'Cadetti', etaMinima: 12, etaMassima: 14, inizioValidita: '2010-01-01', fineValidita: '2012-12-31', descrizione: 'Ragazzi dai 12 ai 14 anni' },
      { nome: 'Junior', etaMinima: 15, etaMassima: 17, inizioValidita: '2007-01-01', fineValidita: '2009-12-31', descrizione: 'Ragazzi dai 15 ai 17 anni' },
      { nome: 'Seniores', etaMinima: 18, etaMassima: 39, inizioValidita: '1985-01-01', fineValidita: '2006-12-31', descrizione: 'Adulti dai 18 ai 39 anni' },
      { nome: 'MastersA', etaMinima: 40, etaMassima: 49, inizioValidita: '1975-01-01', fineValidita: '1984-12-31', descrizione: 'Adulti dai 40 ai 49 anni' },
      { nome: 'MastersB', etaMinima: 50, etaMassima: 99, inizioValidita: '1900-01-01', fineValidita: '1974-12-31', descrizione: 'Adulti dai 50 anni in su' }
    ]);

    await seedAgeGroupConfigurations();

    const configTipiAtleta = await sequelize.models.ConfigTipoAtleta.bulkCreate([
      { id: 1, nome: 'CB Bambini', etaMinima: 5, etaMassima: 12, descrizione: 'Atleti bambini' },
      { id: 2, nome: 'CB Adulti', etaMinima: 13, etaMassima: 99, descrizione: 'Atleti adulti cinture bianche' },
      { id: 3, nome: 'CN', etaMinima: 16, etaMassima: 99, descrizione: 'Atleti adulti cinture nere' }
    ]);

    const configEsperienze = await sequelize.models.ConfigEsperienza.bulkCreate([
      { nome: 'Esordiente', descrizione: 'Atleta con al massimo 3 match combattuti', idConfigTipoAtleta: 1, tipiCompetizione: [3], attivo: true },
      { nome: 'Esperto', descrizione: 'Atleta con 4 o più match combattuti', idConfigTipoAtleta: 1, tipiCompetizione: [3], attivo: true },
      { nome: 'I livello', descrizione: 'Atleta iscritto a settembre dell\'anno corrente', idConfigTipoAtleta: 1, tipiCompetizione: [1], attivo: true },
      { nome: 'II livello', descrizione: 'Atleta iscritto da 1 oppure 2 anni', idConfigTipoAtleta: 1, tipiCompetizione: [1], attivo: true },
      { nome: 'III livello', descrizione: 'Atleta iscritto da 3 o più anni', idConfigTipoAtleta: 1, tipiCompetizione: [1], attivo: true },
      { nome: 'Esordiente', descrizione: 'Atleta con al massimo 3 match combattuti', idConfigTipoAtleta: 2, tipiCompetizione: [3], attivo: true },
      { nome: 'Esperto', descrizione: 'Atleta con 4 o più match combattuti', idConfigTipoAtleta: 2, tipiCompetizione: [3], attivo: true },
      { nome: 'I livello', descrizione: 'Atleta iscritto a settembre dell\'anno corrente', idConfigTipoAtleta: 2, tipiCompetizione: [1], attivo: true },
      { nome: 'II livello', descrizione: 'Atleta iscritto da 1 oppure 2 anni', idConfigTipoAtleta: 2, tipiCompetizione: [1], attivo: true },
      { nome: 'III livello', descrizione: 'Atleta iscritto da 3 o più anni', idConfigTipoAtleta: 2, tipiCompetizione: [1], attivo: true },
      { nome: 'Esordiente', descrizione: 'Atleta con al massimo 3 match combattuti', idConfigTipoAtleta: 3, tipiCompetizione: [3], attivo: true },
      { nome: 'Esperto', descrizione: 'Atleta con 4 o più match combattuti', idConfigTipoAtleta: 3, tipiCompetizione: [3], attivo: true },
    ]);

    console.log('✅ Configurazioni create');

    // Seed Clubs
    const clubs = await Club.bulkCreate([
      {
        denominazione: 'Accademia Nuovo Cielo',
        codiceFiscale: 'CFACCNCIELO01',
        partitaIva: 'PIACCNCIELO01',
        indirizzo: 'Via Col del Lis 1',
        legaleRappresentante: 'Valerio Verde',
        direttoreTecnico: 'Mario Rossi',
        recapitoTelefonico: '',
        email: ''
      },
      {
        denominazione: 'Club Truong Son',
        codiceFiscale: 'CFTRUONGSON02',
        partitaIva: 'PITRUONGSON02',
        indirizzo: 'Via Massari 1',
        legaleRappresentante: 'Marilena Crivellaro',
        direttoreTecnico: 'Giuseppe Bianchi',
        recapitoTelefonico: '',
        email: ''
      },
      {
        denominazione: 'Club Hoa Lu',
        codiceFiscale: 'CFHOALU03',
        partitaIva: 'PIHOALU03',
        indirizzo: 'Via Italia 1',
        legaleRappresentante: 'Marco Bottosso',
        direttoreTecnico: 'Luca Verdi',
        recapitoTelefonico: '',
        email: ''
      }
    ]);
    console.log('✅ Club creati');

    // Seed Atleti
    const atleti = await Atleta.bulkCreate([
      {
        nome: 'Andrea',
        cognome: 'Ferrari',
        dataNascita: '1995-03-15',
        sesso: 'M',
        codiceFiscale: 'FRRNDR95C15F205Y',
        peso: 68.5,
        tipoAtletaId: 3,
        telefono: '333-1111111',
        email: 'andrea.ferrari@email.com',
        clubId: 1
      },
      {
        nome: 'Sofia Giulia',
        cognome: 'Martini',
        dataNascita: '1998-07-22',
        sesso: 'F',
        codiceFiscale: 'MRTSIA98L62F205Z',
        peso: 55.0,
        tipoAtletaId: 3,
        telefono: '333-2222222',
        email: 'sofia.martini@email.com',
        clubId: 1
      },
      {
        nome: 'Marco',
        cognome: 'Romano',
        dataNascita: '1992-11-08',
        sesso: 'M',
        codiceFiscale: 'RMNMRC92S08L219W',
        peso: 75.2,
        tipoAtletaId: 3,
        telefono: '333-3333333',
        email: 'marco.romano@email.com',
        clubId: 2
      },
      {
        nome: 'Giulia',
        cognome: 'Conti',
        dataNascita: '1996-05-12',
        sesso: 'F',
        codiceFiscale: 'CNTGLI96E52H501X',
        peso: 60.0,
        tipoAtletaId: 3,
        telefono: '333-4444444',
        email: 'giulia.conti@email.com',
        clubId: 3
      }
    ]);
    console.log('✅ Atleti creati');

    // Seed Giudici
    const giudici = await Giudice.bulkCreate([
      {
        nome: 'Roberto',
        cognome: 'Esposito',
        dataNascita: '1975-09-30',
        codiceFiscale: 'SPRRBT75P30F839V',
        livelloEsperienza: 'Nazionale',
        specializzazione: 'Kata',
        certificazioni: 'Arbitro Nazionale, Corso Aggiornamento 2023',
        telefono: '333-5555555',
        email: 'roberto.esposito@email.com',
        clubId: 1
      },
      {
        nome: 'Elena',
        cognome: 'Ricci',
        dataNascita: '1980-12-18',
        codiceFiscale: 'RCCLEN80T58L219Y',
        livelloEsperienza: 'Regionale',
        specializzazione: 'Kumite',
        certificazioni: 'Arbitro Regionale',
        telefono: '333-6666666',
        email: 'elena.ricci@email.com',
        clubId: 2
      },
      {
        nome: 'Alessandro',
        cognome: 'Moretti',
        dataNascita: '1972-04-25',
        codiceFiscale: 'MRTLSN72D25H501Z',
        livelloEsperienza: 'Internazionale',
        specializzazione: 'Kata e Kumite',
        certificazioni: 'Arbitro Internazionale WKF, Corso Aggiornamento 2024',
        telefono: '333-7777777',
        email: 'alessandro.moretti@email.com',
        clubId: 3
      }
    ]);
    console.log('✅ Giudici creati');

    // Seed Competizioni
    const competizioni = await Competizione.bulkCreate([
      {
        nome: 'Campionato Regionale Piemonte 2025',
        descrizione: 'Campionato regionale di quyen per bambini di tutte le età',
        dataInizio: new Date('2025-12-13T09:00:00'),
        dataFine: new Date('2025-12-14T18:00:00'),
        luogo: 'Palazzetto dello Sport - Chivasso',
        indirizzo: 'Via dello Sport 1, Chivasso',
        tipiCompetizione: [1],
        livello: 'Regionale',
        stato: 'Aperta',
        maxPartecipanti: 300,
        quotaIscrizione: 15.00,
        dataScadenzaIscrizioni: new Date('2025-12-05T23:59:59'),
        organizzatoreClubId: 1
      },
      {
        nome: 'Torneo Nazionale Quyen Fiwuk 2025',
        descrizione: 'Torneo nazionale per specialisti di quyen mani nude e con armi',
        dataInizio: new Date('2025-11-15T10:00:00'),
        dataFine: new Date('2025-11-18T17:00:00'),
        luogo: 'Centro Congressi - Roma',
        indirizzo: 'Via dei Congressi 50, Roma',
        tipiCompetizione: [1],
        livello: 'Nazionale',
        stato: 'Conclusa',
        maxPartecipanti: 150,
        quotaIscrizione: 35.00,
        dataScadenzaIscrizioni: new Date('2025-11-01T23:59:59'),
        organizzatoreClubId: 2
      }
    ]);
    console.log('✅ Competizioni create');

    // Seed Categorie
    const categorie = await Categoria.bulkCreate([]);
    console.log('✅ Categorie create');

    // Seed Utenti
    const utentiLogin = await UtentiLogin.bulkCreate([
      {
        username: 'SuperAdmin',
        email: 'ashiokpower@gmail.com',
        password: '580d9331406ab2749644825c824dc689e13f4c7669b092784015e825dc099884', //psw: scurreggioniN.1
        status: 'E',
        clubId: 1,
        permissions: 'superAdmin',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Accademia Nuovo Cielo',
        email: 'segreteriaANC@gmail.com',
        password: '89b230b40443cefaa94d4a523c678739884d6cc5aefb5390e27e5726569abbed', //psw: scurreggioni
        status: 'E',
        clubId: 1,
        permissions: 'club',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Truong Son',
        email: 'segreteriaTS@gmail.com',
        password: '3b75d0f2f0dfdad678fa2e3e8e49e062f193a2432e6a53dc7ac718e209f6e615', //psw: formadibastone
        status: 'E',
        clubId: 2,
        permissions: 'club',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Tavolo1',
        email: 'tavolo1@gmail.com',
        password: '5048d49079ca14cb3f9ff9a9bba623a89c7713a1ecb4ffb10f712d2596682591', //psw: bastoneDagnogo21
        status: 'E',
        permissions: 'tableUser',
        salt: 'de684853376e06375694'
      }
    ]);

    console.log('🎉 Seed completato con successo!');
    console.log('');
    console.log('📊 Dati creati:');
    console.log(`   - ${clubs.length} Club`);
    console.log(`   - ${atleti.length} Atleti`);
    console.log(`   - ${giudici.length} Giudici`);
    console.log(`   - ${competizioni.length} Competizioni`);
    console.log(`   - ${categorie.length} Categorie`);
    console.log(`   - ${utentiLogin.length} UtentiLogin`);

  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
  }
};

const seedConfigurations = async () => {
  const configGruppiEta = await sequelize.models.ConfigGruppoEta.bulkCreate([
    { nome: 'Pulcini', etaMinima: 4, etaMassima: 6, inizioValidita: '2018-01-01', fineValidita: '2022-12-31', descrizione: 'Bambini dai 4 ai 6 anni' },
    { nome: 'Bambini', etaMinima: 7, etaMassima: 8, inizioValidita: '2016-01-01', fineValidita: '2017-12-31', descrizione: 'Bambini dai 7 ai 8 anni' },
    { nome: 'Esordienti', etaMinima: 9, etaMassima: 11, inizioValidita: '2013-01-01', fineValidita: '2015-12-31', descrizione: 'Bambini dagli 9 agli 11 anni' },
    { nome: 'Cadetti', etaMinima: 12, etaMassima: 14, inizioValidita: '2010-01-01', fineValidita: '2012-12-31', descrizione: 'Ragazzi dai 12 ai 14 anni' },
    { nome: 'Junior', etaMinima: 15, etaMassima: 17, inizioValidita: '2007-01-01', fineValidita: '2009-12-31', descrizione: 'Ragazzi dai 15 ai 17 anni' },
    { nome: 'Seniores', etaMinima: 18, etaMassima: 39, inizioValidita: '1985-01-01', fineValidita: '2006-12-31', descrizione: 'Adulti dai 18 ai 39 anni' },
    { nome: 'MastersA', etaMinima: 40, etaMassima: 49, inizioValidita: '1975-01-01', fineValidita: '1984-12-31', descrizione: 'Adulti dai 40 ai 49 anni' },
    { nome: 'MastersB', etaMinima: 50, etaMassima: 99, inizioValidita: '1900-01-01', fineValidita: '1974-12-31', descrizione: 'Adulti dai 50 anni in su' }
  ]);

  await seedAgeGroupConfigurations();

  console.log('✅ Configurazioni create');
}



module.exports = { seedData, seedConfigurations, seedAgeGroupConfigurations };

// Esegui il seed se questo file viene chiamato direttamente
// Uso: node seedDatabase.js [configurations|ageGroups]  (default: configurations)
if (require.main === module) {
  const seeds = {
    configurations: seedConfigurations,
    ageGroups: seedAgeGroupConfigurations
  };
  const seedName = process.argv[2] || 'configurations';
  const seed = seeds[seedName];
  if (!seed) {
    console.error(`Seed sconosciuto '${seedName}'. Valori ammessi: ${Object.keys(seeds).join(', ')}`);
    process.exit(1);
  }
  seed()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Errore durante il seed:', error);
      process.exit(1);
    });
}
