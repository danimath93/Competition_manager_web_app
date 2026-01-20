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
                Il sottoscritto, in qualità di Direttore / Responsabile del Club o della Associazione Sportiva,
              </p>

              <h4 className="privacy-section-title">DICHIARA</h4>
              <ul className="privacy-list">
                <li>di essere legittimamente autorizzato ad operare per conto del Club o della Associazione Sportiva rappresentata;</li>
                <li>
                  che tutti gli atleti inseriti nella piattaforma hanno fornito valido, specifico e documentato
                  consenso al trattamento dei propri dati personali e dei dati relativi alla salute;
                </li>
                <li>
                  che i certificati medici sportivi caricati attestano l'idoneità alla pratica sportiva
                  e sono raccolti dal Club o dalla Associazione Sportiva nel rispetto della normativa vigente.
                </li>
              </ul>

              <h4 className="privacy-section-title">AUTORIZZA</h4>
              <p>
                il trattamento dei dati personali e dei dati relativi alla salute degli atleti
                (es. certificati medici sportivi in formato PDF o immagine)
                esclusivamente per le seguenti finalità:
              </p>
              <ul className="privacy-list">
                <li>gestione delle iscrizioni alle competizioni sportive e relative pubblicazioni dei risultati;</li>
                <li>verifica dell'idoneità sportiva degli atleti;</li>
                <li>adempimenti organizzativi, regolamentari e di sicurezza connessi alle competizioni.</li>
              </ul>

              <h4 className="privacy-section-title">DICHIARA INOLTRE DI ACCETTARE</h4>
              <ul className="privacy-list">
                <li>che il Club o la Associazione Sportiva agisce in qualità di Titolare del trattamento dei dati;</li>
                <li>
                  che la piattaforma "Gestore Competizioni" , fornita da MathKoding e Accademia Nuovo Cielo,
                  agiscano in qualità di Responsabili del trattamento ai sensi dell'art. 28 del GDPR;
                </li>
                <li>che i dati non saranno utilizzati per finalità di marketing o profilazione;</li>
                <li>
                  che i dati sensibili quali certificati medici sportivi e altri eventuali documenti personali, saranno conservati per un periodo massimo di 24 mesi,
                  compatibilmente con la validità dei certificati medici e con eventuali obblighi normativi.
                </li>
              </ul>

              <div className="privacy-disclaimer">
                <p>
                  Il sottoscritto dichiara di manlevare "Gestore Competizioni" e i relativi fornitori
                  (MathKoding e Accademia Nuovo Cielo) da ogni responsabilità derivante dall'assenza,
                  invalidità o incompletezza del consenso fornito dagli atleti.
                </p>
                <p>
                  Il trattamento dei dati avverrà nel rispetto del Regolamento UE 2016/679 (GDPR)
                  e dei principi di liceità, correttezza, minimizzazione, limitazione della conservazione
                  e sicurezza dei dati.
                </p>
                <p>
                  Sarà cura del Club o della Associazione Sportiva rappresentata, inviare una mail in caso di volontà di revoca del consenso o rimozione anticipata dei dati sensibili, 
                  all'indirizzo organizzatoregare@gmail.com specificando nell'oggetto "Revoca Consenso Trattamento Dati Personali" o "Cancellazione Account".
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
