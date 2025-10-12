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

    // Seed Clubs
    const clubs = await Club.bulkCreate([
      {
        nome: 'Karate Club Milano',
        referente: 'Mario Rossi',
        citta: 'Milano',
        indirizzo: 'Via Roma 123',
        telefono: '02-1234567',
        email: 'info@karateclubmilano.it'
      },
      {
        nome: 'Dojo Torino',
        referente: 'Luigi Bianchi',
        citta: 'Torino',
        indirizzo: 'Corso Francia 456',
        telefono: '011-9876543',
        email: 'contact@dojotorino.it'
      },
      {
        nome: 'Samurai Roma',
        referente: 'Giuseppe Verdi',
        citta: 'Roma',
        indirizzo: 'Via Nazionale 789',
        telefono: '06-5555555',
        email: 'info@samurairoma.it'
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
        grado: 'Cintura Nera 2° Dan',
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
        grado: 'Cintura Nera 1° Dan',
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
        grado: 'Cintura Nera 3° Dan',
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
        grado: 'Cintura Nera 2° Dan',
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

    // Seed Configurazioni
    const configTipiCompetizione = await sequelize.models.ConfigTipoCompetizione.bulkCreate([
      { id:1, nome: 'Quyen mani nude', descrizione: 'Competizione di Quyen a mani nude' },
      { id:2, nome: 'Quyen con armi', descrizione: 'Competizione di Quyen con armi tradizionali' },
      { id:3, nome: 'Combattimenti', descrizione: 'Competizione di combattimenti tradizionali' },
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

    console.log('✅ Configurazioni create');

    // Seed Competizioni
    const competizioni = await Competizione.bulkCreate([
      {
        nome: 'Campionato Regionale Lombardia 2024',
        descrizione: 'Campionato regionale di karate per tutte le categorie',
        dataInizio: new Date('2025-12-01T09:00:00'),
        dataFine: new Date('2025-12-10T18:00:00'),
        luogo: 'Palazzetto dello Sport - Milano',
        indirizzo: 'Via dello Sport 1, Milano',
        tipologia: [1,2,3],
        livello: 'Regionale',
        stato: 'Pianificata',
        maxPartecipanti: 200,
        quotaIscrizione: 25.00,
        dataScadenzaIscrizioni: new Date('2025-11-20T23:59:59'),
        organizzatoreClubId: 1
      },
      {
        nome: 'Torneo Nazionale Kata 2024',
        descrizione: 'Torneo nazionale specializzato in Kata tradizionali',
        dataInizio: new Date('2025-11-15T10:00:00'),
        dataFine: new Date('2025-11-18T17:00:00'),
        luogo: 'Centro Congressi - Roma',
        indirizzo: 'Via dei Congressi 50, Roma',
        tipologia: [1],
        livello: 'Nazionale',
        stato: 'Aperta',
        maxPartecipanti: 150,
        quotaIscrizione: 35.00,
        dataScadenzaIscrizioni: new Date('2025-11-01T23:59:59'),
        organizzatoreClubId: 2
      }
    ]);
    console.log('✅ Competizioni create');

    // Seed Categorie
    const categorie = await Categoria.bulkCreate([
      {
        nome: 'Quyen Maschile Seniores',
        descrizione: 'Categoria Quyen per atleti maschi seniores',
        tipologia: 'Kata',
        genere: 'Maschile',
        etaMinima: 18,
        etaMassima: 35,
        gradoMinimo: 'Cintura Nera 1° Dan',
        maxPartecipanti: 32,
        stato: 'Aperta',
        competizioneId: 1
      },
      {
        nome: 'Kata Femminile Seniores',
        descrizione: 'Categoria Kata per atlete femmine seniores',
        tipologia: 'Kata',
        genere: 'Femminile',
        etaMinima: 18,
        etaMassima: 35,
        gradoMinimo: 'Cintura Nera 1° Dan',
        maxPartecipanti: 32,
        stato: 'Aperta',
        competizioneId: 1
      },
      {
        nome: 'Kumite Maschile -70kg',
        descrizione: 'Categoria Kumite maschile fino a 70kg',
        tipologia: 'Kumite',
        genere: 'Maschile',
        etaMinima: 18,
        etaMassima: 35,
        pesoMinimo: 60.0,
        pesoMassimo: 70.0,
        gradoMinimo: 'Cintura Nera 1° Dan',
        maxPartecipanti: 16,
        stato: 'Aperta',
        competizioneId: 1
      },
      {
        nome: 'Kumite Femminile -55kg',
        descrizione: 'Categoria Kumite femminile fino a 55kg',
        tipologia: 'Kumite',
        genere: 'Femminile',
        etaMinima: 18,
        etaMassima: 35,
        pesoMinimo: 50.0,
        pesoMassimo: 55.0,
        gradoMinimo: 'Cintura Nera 1° Dan',
        maxPartecipanti: 16,
        stato: 'Aperta',
        competizioneId: 1
      }
    ]);
    console.log('✅ Categorie create');

// Seed Utenti
    const utentiLogin = await UtentiLogin.bulkCreate([
      {
        username: 'SuperAdmin',
        email: 'ashiokpower@gmail.com',
        password: '580d9331406ab2749644825c824dc689e13f4c7669b092784015e825dc099884', //psw: scurreggioniN.1
        status: 'E',
        permissions: 'superAdmin',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Accademia Nuovo Cielo',
        email: 'segreteriaANC@gmail.com',
        password: '89b230b40443cefaa94d4a523c678739884d6cc5aefb5390e27e5726569abbed', //psw: scurreggioni
        status: 'E',
        permissions: 'admin',
        salt: 'de684853376e06375694'
      },
      {
        username: 'Truong Son',
        email: 'segreteriaTS@gmail.com',
        password: '3b75d0f2f0dfdad678fa2e3e8e49e062f193a2432e6a53dc7ac718e209f6e615', //psw: formadibastone
        status: 'E',
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
