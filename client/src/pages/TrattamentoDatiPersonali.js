import React, { useEffect } from 'react';
import Header from '../components/Header';
import '../components/styles/Layout.css';
import '../components/styles/Login.css';
import './styles/TrattamentoDatiPersonali.css';

const TrattamentoDatiPersonali = () => {
  // Notifica al parent (Register) che la pagina è stata aperta
  useEffect(() => {
    // Se aperta in un nuovo tab, invia un messaggio tramite localStorage
    if (window.opener) {
      localStorage.setItem('privacy_viewed', 'true');
    }
  }, []);

  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <div className="privacy-container">
          <div className="privacy-card">
            <h3 className="text-accent text-center">Informativa sul Trattamento dei Dati Personali</h3>
            
            <div className="privacy-content">
              <p className="privacy-intro">
                Ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR), La informiamo che i dati personali da Lei forniti 
                formeranno oggetto di trattamento nel rispetto della normativa sopra richiamata e degli obblighi di riservatezza.
              </p>

              <h4 className="privacy-section-title">1. TITOLARE DEL TRATTAMENTO</h4>
              <p>
                Il Titolare del trattamento è il Club o l'Associazione Sportiva di appartenenza dell'atleta, 
                rappresentato dal proprio Direttore/Responsabile legalmente autorizzato.
              </p>

              <h4 className="privacy-section-title">2. RESPONSABILI DEL TRATTAMENTO</h4>
              <p>
                La piattaforma "Gestore Competizioni", fornita da MathKoding e A.S.D. Accademia Nuovo Cielo, 
                agisce in qualità di Responsabile del trattamento ai sensi dell'art. 28 del GDPR, con a seguire i relativi contatti:
              </p>
              <ul className="privacy-list">
                <li><strong>MathKoding</strong> di Danilo Dimiccoli, con sede in Settimo Torinese, Via Fratelli Rosselli 11, CAP 10036</li>
                <li>P. IVA: 13168230012, Email: organizzatoregare@gmail.com</li>
                <li><strong>A.S.D. Accademia Nuovo Cielo</strong>, con sede in Settimo Torinese, Via Col del Lys 13/10, CAP 10036, con Presidente e legale rappresentante pro tempore Valerio Verde</li>
                <li>CF: 97668410018, Email: presidenza@accademianuovocielo.it</li>
              </ul>

              <h4 className="privacy-section-title">3. FINALITÀ DEL TRATTAMENTO</h4>
              <p>I dati personali e i dati particolari (dati relativi alla salute) vengono trattati per le seguenti finalità:</p>
              <ul className="privacy-list">
                <li>Gestione delle iscrizioni alle competizioni sportive organizzate dall'Associazione;</li>
                <li>Pubblicazione dei risultati delle competizioni (nome, cognome, categoria, punteggi);</li>
                <li>Verifica dell'idoneità sportiva degli atleti mediante controllo dei certificati medici;</li>
                <li>Adempimenti organizzativi, regolamentari e di sicurezza connessi alle competizioni;</li>
                <li>Obblighi di legge derivanti da normative sportive nazionali e internazionali;</li>
                <li>Archiviazione documentale per finalità di rendicontazione e controllo.</li>
              </ul>

              <h4 className="privacy-section-title">4. BASE GIURIDICA DEL TRATTAMENTO</h4>
              <p>Il trattamento si fonda sulle seguenti basi giuridiche:</p>
              <ul className="privacy-list">
                <li><strong>Consenso esplicito</strong> dell'interessato (art. 6, par. 1, lett. a) e art. 9, par. 2, lett. a) GDPR) per il trattamento dei dati personali e dei dati particolari;</li>
                <li><strong>Esecuzione di un contratto</strong> di cui l'interessato è parte (art. 6, par. 1, lett. b) GDPR) per la gestione dell'iscrizione alle competizioni;</li>
                <li><strong>Adempimento di obblighi di legge</strong> (art. 6, par. 1, lett. c) GDPR) per gli adempimenti normativi in ambito sportivo;</li>
                <li><strong>Interesse pubblico</strong> per finalità statistiche e di ricerca in ambito sportivo (art. 9, par. 2, lett. j) GDPR).</li>
              </ul>

              <h4 className="privacy-section-title">5. CATEGORIE DI DATI TRATTATI</h4>
              <ul className="privacy-list">
                <li><strong>Dati anagrafici:</strong> nome, cognome, data di nascita, luogo di nascita, codice fiscale;</li>
                <li><strong>Dati di contatto:</strong> indirizzo email, numero di telefono (se forniti);</li>
                <li><strong>Dati sportivi:</strong> categoria di appartenenza, livello di esperienza, risultati delle competizioni;</li>
                <li><strong>Dati particolari:</strong> certificati medici sportivi attestanti l'idoneità alla pratica sportiva;</li>
                <li><strong>Documenti:</strong> eventuali documenti di identità e ulteriori certificazioni richieste per la partecipazione.</li>
              </ul>

              <h4 className="privacy-section-title">6. MODALITÀ DI TRATTAMENTO E CONSERVAZIONE</h4>
              <p>
                I dati sono trattati con strumenti manuali, informatici e telematici con logiche strettamente correlate 
                alle finalità sopra indicate e, comunque, in modo da garantire la sicurezza e la riservatezza dei dati stessi.
              </p>
              <p><strong>Periodo di conservazione:</strong></p>
              <ul className="privacy-list">
                <li>I dati personali saranno conservati per il tempo strettamente necessario al conseguimento delle finalità per cui sono raccolti;</li>
                <li>I certificati medici sportivi e altri dati particolari saranno conservati per un periodo massimo di <strong>24 mesi</strong>, 
                compatibilmente con la validità dei certificati e con eventuali obblighi normativi;</li>
                <li>I dati relativi ai risultati delle competizioni potranno essere conservati per finalità statistiche e storiche in forma anonimizzata;</li>
                <li>In caso di contenzioso, i dati potranno essere conservati fino alla definizione dello stesso.</li>
              </ul>

              <h4 className="privacy-section-title">7. DESTINATARI DEI DATI</h4>
              <p>I dati potranno essere comunicati a:</p>
              <ul className="privacy-list">
                <li>Organizzatori delle competizioni sportive per la gestione delle iscrizioni e la pubblicazione dei risultati;</li>
                <li>Federazioni e Enti sportivi di riferimento per adempimenti regolamentari;</li>
                <li>Fornitori di servizi tecnici e informatici che agiscono in qualità di responsabili del trattamento;</li>
                <li>Autorità pubbliche e organi di vigilanza, su richiesta, per adempimenti di legge;</li>
                <li>Giudici e arbitri delle competizioni per la verifica dei requisiti di partecipazione.</li>
              </ul>
              <p>
                I dati <strong>non saranno oggetto di diffusione</strong>, salvo per quanto riguarda i risultati delle competizioni 
                che saranno pubblicati sui canali ufficiali dell'Associazione (nome, cognome, categoria, punteggi).
              </p>

              <h4 className="privacy-section-title">8. TRASFERIMENTO DATI EXTRA UE</h4>
              <p>
                Nell’esercizio delle funzioni primarie della piattaforma, alcuni dati personali potranno essere oggetto di 
                trasferimento presso Paesi e/o organizzazioni extra UE. Per ogni singolo trasferimento di dati presso Paesi, enti e 
                organizzazioni extra UE, il presupposto del lecito trasferimento dei dati personali è dato dall’esistenza di decisioni di 
                adeguatezza emanate dalla Commissione UE per i Paesi che garantiscono il medesimo livello di protezione dei dati 
                trasferiti garantito nella Unione Europea (con la conseguenza che si potrà procedere a trasferire i dati senza vincoli o 
                consenso, come ad esempio nel caso di trasferimento dei dati verso il Vietnam, l’Australia, l’Argentina, la Nuova 
                Zelanda, l’Uruguay, Israele, Hong Kong, la Svizzera) e in assenza di decisioni di adeguatezza, il Responsabile del Trattamento  effettuerà il 
                trasferimento dei dati verso un paese terzo o un’organizzazione internazionale solo se questi avranno fornito garanzie 
                adeguate e a condizione che gli interessati dispongano di diritti azionabili e mezzi di ricorso effettivi.
              </p>

              <h4 className="privacy-section-title">9. DIRITTI DELL'INTERESSATO</h4>
              <p>In qualità di interessato, ha il diritto di:</p>
              <ul className="privacy-list">
                <li><strong>Accesso (art. 15 GDPR):</strong> ottenere conferma dell'esistenza o meno di dati personali che La riguardano 
                e, in tal caso, di ottenerne copia;</li>
                <li><strong>Rettifica (art. 16 GDPR):</strong> ottenere la rettifica dei dati inesatti che La riguardano;</li>
                <li><strong>Cancellazione (art. 17 GDPR):</strong> ottenere la cancellazione dei dati che La riguardano 
                (diritto all'oblio), fatte salve le ipotesi in cui sia obbligatoria la conservazione;</li>
                <li><strong>Limitazione (art. 18 GDPR):</strong> ottenere la limitazione del trattamento quando ricorra una delle ipotesi previste;</li>
                <li><strong>Portabilità (art. 20 GDPR):</strong> ricevere in un formato strutturato, di uso comune e leggibile 
                da dispositivo automatico i dati personali forniti;</li>
                <li><strong>Opposizione (art. 21 GDPR):</strong> opporsi in qualsiasi momento al trattamento dei dati personali 
                che La riguardano per motivi connessi alla Sua situazione particolare;</li>
                <li><strong>Revoca del consenso (art. 7 GDPR):</strong> revocare in qualsiasi momento il consenso prestato, 
                senza pregiudicare la liceità del trattamento basata sul consenso prima della revoca.</li>
              </ul>
              <p>
                Per esercitare i Suoi diritti, può inviare una richiesta via email all'indirizzo: 
                <strong> organizzatoregare@gmail.com</strong> specificando nell'oggetto il diritto che intende esercitare 
                (es. "Richiesta accesso dati personali", "Revoca consenso", "Cancellazione dati").
              </p>

              <h4 className="privacy-section-title">10. DIRITTO DI RECLAMO</h4>
              <p>
                Qualora ritenga che il trattamento dei Suoi dati personali avvenga in violazione del Regolamento UE 2016/679, 
                ha il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali, 
                ai sensi dell'art. 77 del GDPR, o di adire le opportune sedi giudiziarie (art. 79 GDPR).
              </p>
              <p>
                Autorità Garante per la Protezione dei Dati Personali<br/>
                Piazza Venezia n. 11 - 00187 Roma<br/>
                Tel. +39 06.696771<br/>
                Email: garante@gpdp.it<br/>
                PEC: protocollo@pec.gpdp.it<br/>
                Sito web: www.garanteprivacy.it
              </p>

              <h4 className="privacy-section-title">11. NATURA DEL CONFERIMENTO</h4>
              <p>
                Il conferimento dei dati è <strong>necessario</strong> per la partecipazione alle competizioni sportive. 
                Il rifiuto di fornire i dati personali o di prestare il consenso al trattamento dei dati particolari 
                comporterà l'impossibilità di iscriversi e partecipare alle competizioni organizzate.
              </p>

              <h4 className="privacy-section-title">12. SICUREZZA DEI DATI</h4>
              <p>
                Il Titolare del trattamento adotta misure tecniche e organizzative adeguate per garantire un livello 
                di sicurezza appropriato al rischio, inclusi:
              </p>
              <ul className="privacy-list">
                <li>La capacità di assicurare la riservatezza, l'integrità, la disponibilità e la resilienza dei sistemi;</li>
                <li>La capacità di ripristinare tempestivamente la disponibilità e l'accesso dei dati in caso di incidente;</li>
                <li>Una procedura per testare, verificare e valutare regolarmente l'efficacia delle misure tecniche e organizzative.</li>
              </ul>

              <div className="privacy-disclaimer">
                <h4 className="privacy-section-title">DICHIARAZIONE DEL RAPPRESENTANTE DEL CLUB/ASSOCIAZIONE</h4>
                <p>
                  Il sottoscritto, in qualità di Direttore/Responsabile del Club o della Associazione Sportiva, dichiara:
                </p>
                <ul className="privacy-list">
                  <li>Di essere legittimamente autorizzato ad operare per conto del Club o della Associazione Sportiva rappresentata;</li>
                  <li>Che tutti gli atleti inseriti nella piattaforma hanno fornito valido, specifico e documentato consenso 
                  al trattamento dei propri dati personali e dei dati particolari relativi alla salute;</li>
                  <li>Che i certificati medici sportivi caricati attestano l'idoneità alla pratica sportiva e sono stati raccolti 
                  nel rispetto della normativa vigente;</li>
                  <li>Di manlevare "Gestore Competizioni" e i relativi fornitori (MathKoding e Accademia Nuovo Cielo) da ogni 
                  responsabilità derivante dall'assenza, invalidità o incompletezza del consenso fornito dagli atleti;</li>
                  <li>Di aver preso visione della presente informativa e di averne compreso il contenuto.</li>
                </ul>
                
                <p className="privacy-footer">
                  <strong>Ultimo aggiornamento:</strong> Gennaio 2026<br/>
                  <strong>Versione:</strong> 1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrattamentoDatiPersonali;
