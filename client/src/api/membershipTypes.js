import { useEffect, useState } from 'react';
import axios from './axios';

const fetchList = async (url, errorMessage) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
};

// Affiliazioni club, per la registrazione (API pubblica). Restituisce [{ id, name }]
export const loadAssociationMembershipTypes = () =>
  fetchList('/membership-types/association', 'Errore durante il caricamento dei tipi di affiliazione:');

// Tipi di tesseramento selezionabili nella configurazione competizione. Restituisce [{ id, name }]
export const loadCompetitionMembershipTypes = () =>
  fetchList('/membership-types/competition', 'Errore durante il caricamento dei tipi di tesseramento:');

// Tesseramenti ammessi in iscrizione alla competizione (include "Richiedi tesseramento" se abilitato). Restituisce [{ id, name }]
export const loadCompetitionRegistrationMembershipTypes = (competitionId) =>
  fetchList(`/competizioni/${competitionId}/membership-types`, 'Errore durante il caricamento dei tesseramenti della competizione:');

// Hook generico: esegue il loader al mount (e al cambio delle dipendenze); in errore restituisce lista vuota
const useMembershipTypeList = (loader, deps, enabled = true) => {
  const [membershipTypes, setMembershipTypes] = useState([]);

  useEffect(() => {
    if (!enabled) return undefined;
    let isMounted = true;
    loader()
      .then((data) => isMounted && setMembershipTypes(data))
      .catch(() => isMounted && setMembershipTypes([]));
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return membershipTypes;
};

export const useAssociationMembershipTypes = () => useMembershipTypeList(loadAssociationMembershipTypes, []);

export const useCompetitionMembershipTypes = () => useMembershipTypeList(loadCompetitionMembershipTypes, []);

export const useCompetitionRegistrationMembershipTypes = (competitionId) =>
  useMembershipTypeList(() => loadCompetitionRegistrationMembershipTypes(competitionId), [competitionId], !!competitionId);
