const { Op } = require('sequelize');
const { MembershipType, sequelize } = require('../models');

// Id riservato all'opzione speciale "Richiedi tesseramento" (gruppo competition):
// non selezionabile in configurazione, aggiunta in iscrizione se costiIscrizione.tesseramento.enabled.
// Non modificare: è inserito con id esplicito dal seed. Il nome invece può essere rinominato a DB.
const MEMBERSHIP_REQUEST_ID = 1;

// Tipi di tesseramento iniziali (id espliciti per avere gli stessi valori in ogni ambiente)
const DEFAULT_MEMBERSHIP_TYPES = [
  { id: MEMBERSHIP_REQUEST_ID, name: 'Richiedi tesseramento', group: 'competition', sortOrder: 99 },
  { id: 2, name: 'FIWUK', group: 'competition', sortOrder: 1 },
  { id: 3, name: 'ASI', group: 'competition', sortOrder: 2 },
  { id: 4, name: 'ACLI', group: 'competition', sortOrder: 3 },
  { id: 5, name: 'FIWUK', group: 'association', sortOrder: 1 },
  { id: 6, name: 'ASI', group: 'association', sortOrder: 2 },
  { id: 7, name: 'ACLI', group: 'association', sortOrder: 3 },
  { id: 8, name: 'Altro Ente', group: 'association', sortOrder: 99 },
];

const PUBLIC_ATTRIBUTES = ['id', 'name'];
const ORDER = [
  ['sortOrder', 'ASC'],
  ['name', 'ASC'],
];

/**
 * Collega i dettagli iscrizione esistenti (solo testo) al tipo di tesseramento corrispondente per nome.
 * Rieseguibile: aggiorna solo le righe senza membership_type_id
 */
const backfillRegistrationMembershipTypes = async () => {
  const [, result] = await sequelize.query(`
    UPDATE dettagli_iscrizione_atleti d
    SET membership_type_id = mt.id
    FROM membership_types mt
    WHERE d.membership_type_id IS NULL
      AND mt."group" = 'competition'
      AND UPPER(mt.name) = UPPER(d.tesseramento)
  `);
  return result?.rowCount || 0;
};

/**
 * Inserisce i tipi di tesseramento di default solo se la tabella è vuota,
 * così le modifiche fatte a DB (disattivazioni, nuovi tipi) non vengono sovrascritte.
 * Con id espliciti la sequenza non avanza: viene riallineata per i successivi inserimenti.
 */
const seedMembershipTypes = async () => {
  let created = 0;
  if ((await MembershipType.count()) === 0) {
    await MembershipType.bulkCreate(DEFAULT_MEMBERSHIP_TYPES);
    await sequelize.query(`SELECT setval(pg_get_serial_sequence('membership_types', 'id'), (SELECT MAX(id) FROM membership_types))`);
    created = DEFAULT_MEMBERSHIP_TYPES.length;
  }
  const linked = await backfillRegistrationMembershipTypes();
  return { created, linked };
};

// Tipi di affiliazione club (registrazione)
const getAssociationMembershipTypes = () =>
  MembershipType.findAll({ where: { group: 'association', active: true }, attributes: PUBLIC_ATTRIBUTES, order: ORDER });

// Tipi selezionabili in configurazione competizione (esclusa l'opzione "Richiedi tesseramento")
const getSelectableCompetitionMembershipTypes = () =>
  MembershipType.findAll({
    where: { group: 'competition', active: true, id: { [Op.ne]: MEMBERSHIP_REQUEST_ID } },
    attributes: PUBLIC_ATTRIBUTES,
    order: ORDER,
  });

/**
 * Tipi ammessi in iscrizione alla competizione:
 * - tipi selezionati in configurazione (membershipTypeIds null = competizione precedente: tutti i tipi attivi)
 * - "Richiedi tesseramento" se abilitato nei costi (sempre, per le competizioni precedenti)
 */
const getCompetitionMembershipTypes = async (competizione) => {
  const selectedIds = competizione.membershipTypeIds;
  const requestEnabled = !Array.isArray(selectedIds) || !!competizione.costiIscrizione?.tesseramento?.enabled;
  const ids = Array.isArray(selectedIds) ? [...selectedIds] : null;

  const where = { group: 'competition', active: true };
  if (ids) {
    if (requestEnabled) ids.push(MEMBERSHIP_REQUEST_ID);
    where.id = { [Op.in]: ids };
  } else if (!requestEnabled) {
    where.id = { [Op.ne]: MEMBERSHIP_REQUEST_ID };
  }
  return MembershipType.findAll({ where, attributes: PUBLIC_ATTRIBUTES, order: ORDER });
};

/**
 * Normalizza i tipi di tesseramento selezionati per una competizione:
 * tiene solo id di tipi attivi del gruppo "competition", esclusa l'opzione "Richiedi tesseramento"
 * @param {Array} ids - id selezionati
 * @returns {Promise<{ ids: number[], invalid: Array }>}
 */
const normalizeCompetitionMembershipTypeIds = async (ids) => {
  if (!Array.isArray(ids)) return { ids: [], invalid: [] };
  const requested = [...new Set(ids.map((id) => parseInt(id, 10)))];
  const valid = await getSelectableCompetitionMembershipTypes();
  const validIds = new Set(valid.map((t) => t.id));
  return {
    ids: requested.filter((id) => validIds.has(id)),
    invalid: ids.filter((id) => !validIds.has(parseInt(id, 10))),
  };
};

const isMembershipRequestId = (membershipTypeId) => membershipTypeId === MEMBERSHIP_REQUEST_ID;

module.exports = {
  MEMBERSHIP_REQUEST_ID,
  DEFAULT_MEMBERSHIP_TYPES,
  seedMembershipTypes,
  getAssociationMembershipTypes,
  getSelectableCompetitionMembershipTypes,
  getCompetitionMembershipTypes,
  normalizeCompetitionMembershipTypeIds,
  isMembershipRequestId,
};
