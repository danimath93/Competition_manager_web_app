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

    // Seed Competizioni
    const competizioni = await Competizione.bulkCreate([
      {
        nome: 'Campionato Regionale Lombardia 2024',
        descrizione: 'Campionato regionale di karate per tutte le categorie',
        dataInizio: new Date('2024-06-15T09:00:00'),
        dataFine: new Date('2024-06-15T18:00:00'),
        luogo: 'Palazzetto dello Sport - Milano',
        indirizzo: 'Via dello Sport 1, Milano',
        tipologia: 'Mista',
        livello: 'Regionale',
        stato: 'Pianificata',
        maxPartecipanti: 200,
        quotaIscrizione: 25.00,
        dataScadenzaIscrizioni: new Date('2024-06-01T23:59:59'),
        organizzatoreClubId: 1
      },
      {
        nome: 'Torneo Nazionale Kata 2024',
        descrizione: 'Torneo nazionale specializzato in Kata tradizionali',
        dataInizio: new Date('2024-07-20T10:00:00'),
        dataFine: new Date('2024-07-21T17:00:00'),
        luogo: 'Centro Congressi - Roma',
        indirizzo: 'Via dei Congressi 50, Roma',
        tipologia: 'Kata',
        livello: 'Nazionale',
        stato: 'Aperta',
        maxPartecipanti: 150,
        quotaIscrizione: 35.00,
        dataScadenzaIscrizioni: new Date('2024-07-05T23:59:59'),
        organizzatoreClubId: 3
      }
    ]);
    console.log('✅ Competizioni create');

    // Seed Categorie
    const categorie = await Categoria.bulkCreate([
      {
        nome: 'Kata Maschile Seniores',
        descrizione: 'Categoria Kata per atleti maschi seniores',
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
        username: 'Accademia Nuovo Cielo',
        email: 'segreteriaANC@gmail.com',
        password: 'scurreggioni',
      },
      {
        username: 'Truong Son',
        email: 'segreteriaTS@gmail.com',
        password: 'formadibastone',
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
