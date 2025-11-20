const { 
  Club, 
  Atleta, 
  Giudice, 
  Competizione, 
  Categoria, 
  IscrizioneAtleta,
  AssegnazioneGiudice,
  UtentiLogin,
  sequelize 
} = require('./models');

const seedData = async () => {
  try {
    // Forza la sincronizzazione del database (ricrea le tabelle)
    await sequelize.sync({ force: true });
    console.log('🗄️  Database sincronizzato');

    // Seed Configurazioni
    const configTipiCompetizione = await sequelize.models.ConfigTipoCompetizione.bulkCreate([
      { id: 1, nome: 'Quyen mani nude', descrizione: 'Competizione di Quyen a mani nude' },
      { id: 2, nome: 'Quyen con armi', descrizione: 'Competizione di Quyen con armi tradizionali' },
      { id: 3, nome: 'Combattimenti', descrizione: 'Competizione di combattimenti marziali' },
      { id: 4, nome: 'Attività complementari', descrizione: 'Attività ludiche o di esibizione' },
    ]);

    const configTipiCategoria = await sequelize.models.ConfigTipoCategoria.bulkCreate([
      { nome: 'Quyen programma', descrizione: 'Categoria per Quyen a mani nude o con armi', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen internazionale', descrizione: 'Categoria per Quyen secondo regolamenti internazionali', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen mani nude a squadre', descrizione: 'Categoria per Quyen a mani nude in squadre', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Song luyen mani nude', descrizione: 'Categoria per Song Luyen a mani nude', tipoCompetizioneId: 1, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi lunghe', descrizione: 'Categoria per Quyen con armi lunghe', tipoCompetizioneId: 2, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi corte', descrizione: 'Categoria per Quyen con armi corte', tipoCompetizioneId: 2, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi snodate', descrizione: 'Categoria per Quyen con armi snodate', tipoCompetizioneId: 2, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Quyen con armi a squadre', descrizione: 'Categoria per Quyen con armi in squadre', tipoCompetizioneId: 2, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Song luyen con armi', descrizione: 'Categoria per Song Luyen con armi', tipoCompetizioneId: 2, idConfigTipiAtleti: [1,2,3], obbligoPeso: false },
      { nome: 'Light contact', descrizione: 'Categoria per combattimenti di light contact', tipoCompetizioneId: 3, idConfigTipiAtleti: [1,2,3], obbligoPeso: true },
      { nome: 'Lotta tradizionale', descrizione: 'Categoria per combattimenti di lotta tradizionale vietnamita vat', tipoCompetizioneId: 3, idConfigTipiAtleti: [2,3], obbligoPeso: false },
      { nome: 'Fighting ball', descrizione: 'Categoria per combattimenti fighting ball per bambini', tipoCompetizioneId: 3, idConfigTipiAtleti: [1], obbligoPeso: true },
      { nome: 'Festa di Natale', descrizione: 'Categoria per attività ludiche per bambini', tipoCompetizioneId: 4, idConfigTipiAtleti: [1], obbligoPeso: false }
    ]);

    const configGruppiEta = await sequelize.models.ConfigGruppoEta.bulkCreate([
      { nome: 'Speranze', etaMinima: 6, etaMassima: 8, descrizione: 'Bambini dai 6 ai 8 anni', ordine: 1, attivo: true },
      { nome: 'Pulcini', etaMinima: 9, etaMassima: 11, descrizione: 'Bambini dagli 9 ai 11 anni', ordine: 2, attivo: true },
      { nome: 'Cadetti', etaMinima: 12, etaMassima: 14, descrizione: 'Ragazzi dai 12 ai 14 anni', ordine: 3, attivo: true },
      { nome: 'Juniores', etaMinima: 15, etaMassima: 17, descrizione: 'Giovani dai 15 ai 17 anni', ordine: 4, attivo: true },
      { nome: 'Seniores', etaMinima: 18, etaMassima: 35, descrizione: 'Adulti dai 18 ai 35 anni', ordine: 5, attivo: true },
      { nome: 'Master', etaMinima: 36, etaMassima: 100, descrizione: 'Adulti oltre i 36 anni', ordine: 6, attivo: true }
    ]);

    const configTipiAtleta = await sequelize.models.ConfigTipoAtleta.bulkCreate([
      { id: 1, nome: 'CB Bambini', etaMinima: 5, etaMassima: 12, descrizione: 'Atleti bambini' },
      { id: 2, nome: 'CB Adulti', etaMinima: 13, etaMassima: 99, descrizione: 'Atleti adulti cinture bianche' },
      { id: 3, nome: 'CN', etaMinima: 16, etaMassima: 99, descrizione: 'Atleti adulti cinture nere' }
    ]);

    const configEsperienze = await sequelize.models.ConfigEsperienza.bulkCreate([
      { nome: 'Esordiente', descrizione: 'Atleta con al massimo 3 match combattuti', idConfigTipoAtleta: 1, tipiCompetizione: [3], attivo: true },
      { nome: 'Esperto', descrizione: 'Atleta con 4 o più match combattuti', idConfigTipoAtleta: 1, tipiCompetizione: [3], attivo: true },
      { nome: 'I livello', descrizione: 'Atleta iscritto a settembre dell\'anno corrente', idConfigTipoAtleta: 1, tipiCompetizione: [1,2], attivo: true },
      { nome: 'II livello', descrizione: 'Atleta iscritto da 1 oppure 2 anni', idConfigTipoAtleta: 1, tipiCompetizione: [1, 2], attivo: true },
      { nome: 'III livello', descrizione: 'Atleta iscritto da 3 o più anni', idConfigTipoAtleta: 1, tipiCompetizione: [1, 2], attivo: true },
      { nome: 'Esordiente', descrizione: 'Atleta con al massimo 3 match combattuti', idConfigTipoAtleta: 2, tipiCompetizione: [3], attivo: true },
      { nome: 'Esperto', descrizione: 'Atleta con 4 o più match combattuti', idConfigTipoAtleta: 2, tipiCompetizione: [3], attivo: true },
      { nome: 'I livello', descrizione: 'Atleta iscritto a settembre dell\'anno corrente', idConfigTipoAtleta: 2, tipiCompetizione: [1,2], attivo: true },
      { nome: 'II livello', descrizione: 'Atleta iscritto da 1 oppure 2 anni', idConfigTipoAtleta: 2, tipiCompetizione: [1, 2], attivo: true },
      { nome: 'III livello', descrizione: 'Atleta iscritto da 3 o più anni', idConfigTipoAtleta: 2, tipiCompetizione: [1, 2], attivo: true },
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
        tipologia: [1,2],
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
        tipologia: [1],
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

module.exports = seedData;

// Esegui il seed se questo file viene chiamato direttamente
if (require.main === module) {
  seedData().then(() => {
    process.exit(0);
  });
}
