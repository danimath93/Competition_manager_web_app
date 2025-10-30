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
      { id: 3, nome: 'Combattimenti', descrizione: 'Competizione di combattimenti tradizionali' },
    ]);

    const configTipiCategoria = await sequelize.models.ConfigTipoCategoria.bulkCreate([
      { nome: 'Quyen programma', descrizione: 'Categoria per Quyen a mani nude o con armi', tipoCompetizioneId: 1 },
      { nome: 'Quyen internazionale', descrizione: 'Categoria per Quyen secondo regolamenti internazionali', tipoCompetizioneId: 1 },
      { nome: 'Quyen mani nude a squadre', descrizione: 'Categoria per Quyen a mani nude in squadre', tipoCompetizioneId: 1 },
      { nome: 'Song luyen mani nude', descrizione: 'Categoria per Song Luyen a mani nude', tipoCompetizioneId: 1 },
      { nome: 'Quyen con armi lunghe', descrizione: 'Categoria per Quyen con armi lunghe', tipoCompetizioneId: 2 },
      { nome: 'Quyen con armi corte', descrizione: 'Categoria per Quyen con armi corte', tipoCompetizioneId: 2 },
      { nome: 'Quyen con armi snodate', descrizione: 'Categoria per Quyen con armi snodate', tipoCompetizioneId: 2 },
      { nome: 'Quyen con armi a squadre', descrizione: 'Categoria per Quyen con armi in squadre', tipoCompetizioneId: 2 },
      { nome: 'Song luyen con armi', descrizione: 'Categoria per Song Luyen con armi', tipoCompetizioneId: 2 },
      { nome: 'Combattimento normale', descrizione: 'Categoria per combattimenti normali', tipoCompetizioneId: 3 },
      { nome: 'Combattimento vat', descrizione: 'Categoria per combattimenti di tipo vat', tipoCompetizioneId: 3 }
    ]);

    const configGruppiEta = await sequelize.models.ConfigGruppoEta.bulkCreate([
      { nome: 'Speranze', etaMinima: 6, etaMassima: 8, descrizione: 'Bambini dai 6 ai 8 anni', ordine: 1 },
      { nome: 'Pulcini', etaMinima: 9, etaMassima: 11, descrizione: 'Bambini dagli 9 ai 11 anni', ordine: 2 },
      { nome: 'Cadetti', etaMinima: 12, etaMassima: 14, descrizione: 'Ragazzi dai 12 ai 14 anni', ordine: 3 },
      { nome: 'Juniores', etaMinima: 15, etaMassima: 17, descrizione: 'Giovani dai 15 ai 17 anni', ordine: 4 },
      { nome: 'Seniores', etaMinima: 18, etaMassima: 35, descrizione: 'Adulti dai 18 ai 35 anni', ordine: 5 },
      { nome: 'Master', etaMinima: 36, etaMassima: 100, descrizione: 'Adulti oltre i 36 anni', ordine: 6 }
    ]);

    const configGradiCintura = await sequelize.models.ConfigGradoCintura.bulkCreate([
      { nome: 'Cintura Bianca B', gruppo: 'Bambini', ordine: 1 },
      { nome: 'I Striscia', gruppo: 'Bambini', ordine: 2 },
      { nome: 'II Striscia', gruppo: 'Bambini', ordine: 3 },
      { nome: 'III Striscia', gruppo: 'Bambini', ordine: 4 },
      { nome: 'IV Striscia', gruppo: 'Bambini', ordine: 5 },
      { nome: 'Cintura Bianca', gruppo: 'Adulti', ordine: 1 },
      { nome: 'I Cap', gruppo: 'Adulti', ordine: 2 },
      { nome: 'II Cap', gruppo: 'Adulti', ordine: 3 },
      { nome: 'III Cap', gruppo: 'Adulti', ordine: 4 },
      { nome: 'IV Cap', gruppo: 'Adulti', ordine: 5 },
      { nome: 'V Cap', gruppo: 'Adulti', ordine: 6 },
      { nome: 'Cintura Nera', gruppo: 'Cinture Nere', ordine: 1 },
      { nome: 'I Dan', gruppo: 'Cinture Nere', ordine: 2 },
      { nome: 'II Dan', gruppo: 'Cinture Nere', ordine: 3 },
      { nome: 'III Dan', gruppo: 'Cinture Nere', ordine: 4 },
      { nome: 'IV Dan', gruppo: 'Cinture Nere', ordine: 5 },
      { nome: 'V Dan', gruppo: 'Cinture Nere', ordine: 6 }
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
        codiceFiscale: 'FRRNDR95C15F205Y',
        peso: 68.5,
        categoria: '-70kg',
        gradoCinturaId: 1,
        telefono: '333-1111111',
        email: 'andrea.ferrari@email.com',
        clubId: 1
      },
      {
        nome: 'Sofia Giulia',
        cognome: 'Martini',
        dataNascita: '1998-07-22',
        codiceFiscale: 'MRTSIA98L62F205Z',
        peso: 55.0,
        categoria: '-55kg',
        gradoCinturaId: 2,
        telefono: '333-2222222',
        email: 'sofia.martini@email.com',
        clubId: 1
      },
      {
        nome: 'Marco',
        cognome: 'Romano',
        dataNascita: '1992-11-08',
        codiceFiscale: 'RMNMRC92S08L219W',
        peso: 75.2,
        categoria: '-80kg',
        gradoCinturaId: 3,
        telefono: '333-3333333',
        email: 'marco.romano@email.com',
        clubId: 2
      },
      {
        nome: 'Giulia',
        cognome: 'Conti',
        dataNascita: '1996-05-12',
        codiceFiscale: 'CNTGLI96E52H501X',
        peso: 60.0,
        categoria: '-60kg',
        gradoCinturaId: 2,
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
        permissions: 'user',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Truong Son',
        email: 'segreteriaTS@gmail.com',
        password: '3b75d0f2f0dfdad678fa2e3e8e49e062f193a2432e6a53dc7ac718e209f6e615', //psw: formadibastone
        status: 'E',
        clubId: 2,
        permissions: 'user',
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
