import React, { useState, useEffect } from 'react';
import { Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import DrawerModal from '../../components/common/DrawerModal';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { uploadClubRegistrationDocuments, confirmClubRegistrationFinal } from '../../api/registrations';
import { getCompetitionCostSummary } from '../../api/competitions';
import '../../components/common/DrawerModal.css';
import '../styles/CompetitionFinalization.css';

const CompetitionFinalization = ({
  open,
  onClose,
  clubRegistration = {},
  competitionId,
  totalCost,
  onFinalizationSuccess,
}) => {
  const { user } = useAuth();
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [error, setError] = useState(null);
  const [ibanCopied, setIbanCopied] = useState(false);

  // Stato per i file
  const [displayedFiles, setDisplayedFiles] = useState({
    confermaPresidente: null,
    bonifico: null,
  });

  const [displayedFileNames, setDisplayedFileNames] = useState({
    confermaPresidente: '',
    bonifico: '',
  });

  const [displayingFileSizes, setDisplayingFileSizes] = useState({
    confermaPresidente: '',
    bonifico: '',
  });

  const [uploadStatus, setUploadStatus] = useState({
    message: '',
    error: false,
  });

  // Stato per il riepilogo costi
  const [costSummary, setCostSummary] = useState(null);
  const [costSummaryLoading, setCostSummaryLoading] = useState(false);
  const [costSummaryError, setCostSummaryError] = useState(null);

  // Carica i dati quando il drawer si apre
  useEffect(() => {
    if (open) {
      // Reset file
      let confermaPresidenteNome = '';
      let confermaPresidenteSize = '';
      if (clubRegistration?.confermaPresidenteDocumento && clubRegistration?.confermaPresidenteDocumento.nomeFile) {
        confermaPresidenteNome = clubRegistration.confermaPresidenteDocumento.nomeFile;
        confermaPresidenteSize = (parseFloat(clubRegistration.confermaPresidenteDocumento.dimensione) / (1024 * 1024)).toFixed(2);
      }

      let bonificoNome = '';
      let bonificoSize = '';
      if (clubRegistration?.bonificoDocumento && clubRegistration?.bonificoDocumento.nomeFile) {
        bonificoNome = clubRegistration.bonificoDocumento.nomeFile;
        bonificoSize = (parseFloat(clubRegistration.bonificoDocumento.dimensione) / (1024 * 1024)).toFixed(2);
      }

      setDisplayedFiles({
        confermaPresidente: null,
        bonifico: null,
      });
      setDisplayedFileNames({
        confermaPresidente: confermaPresidenteNome,
        bonifico: bonificoNome,
      });
      setDisplayingFileSizes({
        confermaPresidente: 'File size ' + confermaPresidenteSize + ' MB',
        bonifico: 'File size ' + bonificoSize + ' MB',
      });
      setUploadStatus({
        message: '',
        error: false,
      });
      setIbanCopied(false);

      // Carica riepilogo costi
      loadCostSummary();
    }
  }, [open, clubRegistration]);

  const loadCostSummary = async () => {
    if (!user?.clubId || !competitionId) return;

    setCostSummaryLoading(true);
    setCostSummaryError(null);
    try {
      const summary = await getCompetitionCostSummary(user.clubId, competitionId);
      setCostSummary(summary);
    } catch (err) {
      setCostSummaryError('Errore nel caricamento del riepilogo costi');
      setCostSummary(null);
    } finally {
      setCostSummaryLoading(false);
    }
  };

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      setUploadStatus({
        message: 'Solo file PDF sono accettati',
        error: true
      });
      event.target.value = '';
      return;
    }

    // Verifica dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        message: 'Il file non può superare i 10MB',
        error: true
      });
      event.target.value = '';
      return;
    }

    setDisplayedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    setDisplayedFileNames(prev => ({
      ...prev,
      [fileType]: file.name
    }));

    setUploadStatus({
      message: '',
      error: false
    });
  };

  const handleRemoveFile = (fileType) => {
    setDisplayedFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    setDisplayedFileNames(prev => ({
      ...prev,
      [fileType]: ''
    }));

    // Reset input file
    const input = document.getElementById(`${fileType}-input`);
    if (input) input.value = '';

    // Reset file size display
    setDisplayingFileSizes(prev => ({
      ...prev,
      [fileType]: ''
    }));
  };

  const handleCopyIban = async () => {
    if (costSummary?.versamento?.iban) {
      try {
        await navigator.clipboard.writeText(costSummary.versamento.iban);
        setIbanCopied(true);
        setTimeout(() => setIbanCopied(false), 2000);
      } catch (err) {
        console.error('Errore durante la copia dell\'IBAN:', err);
      }
    }
  };

  const handleUploadAndFinalize = async () => {
    // Verifica che ci siano i file obbligatori
    if (!displayedFiles.confermaPresidente && !displayedFileNames.confermaPresidente) {
      setUploadStatus({
        message: 'Il documento di conferma del presidente è obbligatorio',
        error: true
      });
      return;
    }

    if (!displayedFiles.bonifico && !displayedFileNames.bonifico) {
      setUploadStatus({
        message: 'Il documento di bonifico è obbligatorio per completare l\'iscrizione',
        error: true
      });
      return;
    }

    try {
      setUploadingDocuments(true);
      setError(null);

      // Upload documenti se ci sono nuovi file
      if (displayedFiles.confermaPresidente || displayedFiles.bonifico) {
        await uploadClubRegistrationDocuments(
          user.clubId,
          competitionId,
          displayedFiles.confermaPresidente,
          displayedFiles.bonifico
        );
      }

      // Conferma iscrizione
      await confirmClubRegistrationFinal(user.clubId, competitionId);

      setUploadStatus({
        message: 'Iscrizione finalizzata con successo!',
        error: false
      });

      // Chiama callback di successo
      if (onFinalizationSuccess) {
        onFinalizationSuccess();
      }

      // Chiudi drawer dopo un breve delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      console.error('Errore durante la finalizzazione:', err);
      setError('Errore durante la finalizzazione: ' + (err.response?.data?.error || err.message));
      setUploadStatus({
        message: '',
        error: false
      });
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Verifica se tutti i documenti obbligatori sono presenti
  const hasAllRequiredDocuments = 
    (displayedFiles.confermaPresidente || displayedFileNames.confermaPresidente) &&
    (displayedFiles.bonifico || displayedFileNames.bonifico);

  const canFinalize = hasAllRequiredDocuments && !uploadingDocuments;

  // Calcola la dimensione del file
  const getFileSize = (fileObject) => {
    if (fileObject && fileObject.size) {
      const sizeInMB = (fileObject.size / (1024 * 1024)).toFixed(2);
      return `File Size ${sizeInMB}MB`;
    }
    return '';
  };

  const FileUploadBox = ({ fileType, label, description, required }) => {
    const fileName = displayedFileNames[fileType];
    const hasFile = !!fileName;
    const fileObject = displayedFiles[fileType];
    const fileSize = displayingFileSizes[fileType] || getFileSize(displayedFiles[fileType]);

    return (
      <div className="file-upload-wrapper">
        <div className="file-upload-label">
          {label} {required && <span className="required-mark">*</span>}
        </div>
        <p className="file-upload-description">{description}</p>
        
        <div className={`file-upload-box ${hasFile ? 'has-file' : ''}`}>
          {hasFile ? (
            <>
              <div className="file-content-center">
                <div className="file-name-display">{fileName}</div>
                {fileSize && (
                  <div className="file-size-display">{fileSize}</div>
                )}
              </div>
              <div className="file-actions">
                <IconButton size="small"
                  onClick={() => handleRemoveFile(fileType)}
                >
                  <Delete />
                </IconButton> 
              </div>
            </>
          ) : (
            <div className="file-upload-action">
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id={`${fileType}-input`}
                type="file"
                onChange={(e) => handleFileChange(fileType, e)}
              />
              <div className="upload-prompt">
                {/* <span className="upload-text">Trascina qui il tuo file o </span> */}
                <label htmlFor={`${fileType}-input`} className="upload-label">
                  Seleziona un file
                </label>
              </div>
              <div className="upload-requirements">
                Formato accettato: PDF | Dimensione massima: 10MB per file
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const footer = (
    <div className="drawer-footer-actions">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={uploadingDocuments}
      >
        Annulla
      </Button>
      <Button
        variant="success"
        onClick={handleUploadAndFinalize}
        disabled={!canFinalize}
      >
        {uploadingDocuments ? (
          <>
            <i className="fa fa-spinner fa-spin" /> Finalizzazione in corso...
          </>
        ) : (
          <>
            <i className="fa fa-check" /> Completa Iscrizione
          </>
        )}
      </Button>
    </div>
  );

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Finalizza iscrizione alla competizione"
      footer={footer}
      width="900px"
    >
      {/* Informazioni generali */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Riepilogo iscrizione e costi</h3>
        <div className="drawer-section-content">
          {costSummaryLoading ? (
            <div className="loading-container">
              <i className="fa fa-spinner fa-spin" /> Caricamento riepilogo...
            </div>
          ) : costSummaryError ? (
            <div className="alert alert-danger">{costSummaryError}</div>
          ) : costSummary ? (
            <div>
              <div>
                <p>
                  In totale hai iscritto <strong>{costSummary?.totals?.totalAthletes}</strong> atleti
                  alla competizione per un totale di <strong>{costSummary?.totals?.totalCategories}</strong> categorie.
                </p>
                <p>Di seguito i dettagli:</p>
              </div>

              {/* Dettaglio per tipo atleta */}
              {costSummary?.athleteTypeTotals && Object.entries(costSummary?.athleteTypeTotals).map(([type, detail]) => (
                <div key={type} className="athlete-type-detail">
                  <p>
                    • <strong>{detail.total}</strong> {type} iscritti alla gara, di cui
                  </p>
                  <p className="detail-sub">
                    - {detail.singleCategory} iscritti ad una sola categoria
                  </p>
                  <p className="detail-sub">
                    - {detail.multiCategory} iscritti a 2 o più categorie
                  </p>
                </div>
              ))}

              <div className="divider" />

              {/* Informazioni pagamento */}
              <div className="payment-info">
                <div className="info-block">
                  <label>IBAN per il versamento:</label>
                  <div className="info-value-with-action">
                    <span className="iban-value">{costSummary?.versamento?.iban || 'Non disponibile'}</span>
                    {costSummary?.versamento?.iban && (
                      <button
                        className="btn-icon btn-primary"
                        onClick={handleCopyIban}
                        title={ibanCopied ? 'IBAN copiato!' : 'Copia IBAN'}
                      >
                        <i className={ibanCopied ? 'fa fa-check' : 'fa fa-copy'} />
                      </button>
                    )}
                  </div>
                  {ibanCopied && <span className="copy-feedback">IBAN copiato negli appunti!</span>}
                </div>

                <div className="info-block">
                  <label>Intestatario:</label>
                  <span className="info-value">{costSummary?.versamento?.intestatario || 'Non disponibile'}</span>
                </div>

                <div className="info-block">
                  <label>Causale:</label>
                  <span className="info-value">{costSummary?.versamento?.causale || 'Non disponibile'}</span>
                </div>
              </div>

              <div className="divider" />

              <strong>Costo totale: {(costSummary.totalCost != null ? costSummary.totalCost : totalCost)?.toFixed(2)} €</strong>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sezione Upload Documenti */}
      <div className="drawer-section">
        <h3 className="drawer-section-title">Documenti richiesti</h3>
        <div className="drawer-section-content">
          <FileUploadBox
            fileType="confermaPresidente"
            label="Dichiarazione del Presidente"
            required={true}
          />

          <FileUploadBox
            fileType="bonifico"
            label="Ricevuta Bonifico"
            required={true}
          />

          {uploadStatus.message && (
            <div className={`alert ${uploadStatus.error ? 'alert-danger' : 'alert-success'}`}>
              {uploadStatus.message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

        </div>
      </div>
    </DrawerModal>
  );
};

export default CompetitionFinalization;
