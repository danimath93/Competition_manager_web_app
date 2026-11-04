const { ConfigTipoCategoria, ConfigTipoCompetizione } = require('../models');

/**
 * Verifica che l'insieme finale di categorie di un atleta rispetti i limiti della competizione:
 * - maxCategorieAtleta: numero massimo di categorie totali
 * - maxCategorieTipoCompetizione: { idTipoCompetizione: max } numero massimo per tipo competizione
 *
 * @param {Object} competizione - istanza Competizione
 * @param {number[]} tipoCategoriaIds - id dei tipi categoria a cui l'atleta risulterà iscritto
 * @returns {Promise<string|null>} messaggio di errore oppure null se i limiti sono rispettati
 */
const checkCategoryLimits = async (competizione, tipoCategoriaIds) => {
  const uniqueIds = [...new Set(tipoCategoriaIds.map(Number))];

  if (competizione.maxCategorieAtleta && uniqueIds.length > competizione.maxCategorieAtleta) {
    return `Puoi selezionare al massimo ${competizione.maxCategorieAtleta} categorie per questa competizione`;
  }

  const limitsByType = competizione.maxCategorieTipoCompetizione || {};
  if (Object.keys(limitsByType).length === 0) {
    return null;
  }

  const tipiCategoria = await ConfigTipoCategoria.findAll({
    where: { id: uniqueIds },
    attributes: ['id', 'tipoCompetizioneId']
  });

  const countByType = {};
  tipiCategoria.forEach(tc => {
    countByType[tc.tipoCompetizioneId] = (countByType[tc.tipoCompetizioneId] || 0) + 1;
  });

  const exceededTypeIds = Object.entries(countByType)
    .filter(([typeId, count]) => limitsByType[typeId] && count > limitsByType[typeId])
    .map(([typeId]) => Number(typeId));

  if (exceededTypeIds.length === 0) {
    return null;
  }

  const tipiCompetizione = await ConfigTipoCompetizione.findAll({
    where: { id: exceededTypeIds },
    attributes: ['id', 'nome']
  });

  return exceededTypeIds
    .map(typeId => {
      const nome = tipiCompetizione.find(t => t.id === typeId)?.nome || `tipo ${typeId}`;
      return `Puoi selezionare al massimo ${limitsByType[typeId]} categorie di tipo ${nome}`;
    })
    .join('. ');
};

module.exports = { checkCategoryLimits };
