const sequelize = require('../config/database');

// Importa tutti i modelli
const Club = require('./Club');
const Atleta = require('./Atleta');
const Giudice = require('./Giudice');
const Competizione = require('./Competizione');
const Categoria = require('./Categoria');
const IscrizioneAtleta = require('./IscrizioneAtleta');
const IscrizioneClub = require('./IscrizioneClub');
const AssegnazioneGiudice = require('./AssegnazioneGiudice');
const UtentiLogin = require('./UtentiLogin');
const ConfigTipoCompetizione = require('./ConfigTipoCompetizione');
const ConfigTipoCategoria = require('./ConfigTipoCategoria');
const ConfigGruppoEta = require('./ConfigGruppoEta');
const ConfigTipoAtleta = require('./ConfigTipoAtleta');
const ConfigEsperienza = require('./ConfigEsperienza');

// Definisci le associazioni

// Club -> Atleti (One-to-Many)
Club.hasMany(Atleta, {
  foreignKey: 'clubId',
  as: 'atleti',
  onDelete: 'RESTRICT'
});
Atleta.belongsTo(Club, {
  foreignKey: 'clubId',
  as: 'club'
});

// Club -> Giudici (One-to-Many)
Club.hasMany(Giudice, {
  foreignKey: 'clubId',
  as: 'giudici',
  onDelete: 'RESTRICT'
});
Giudice.belongsTo(Club, {
  foreignKey: 'clubId',
  as: 'club'
});

// Club -> Competizioni organizzate (One-to-Many)
Club.hasMany(Competizione, {
  foreignKey: 'organizzatoreClubId',
  as: 'competizioniOrganizzate',
  onDelete: 'SET NULL'
});
Competizione.belongsTo(Club, {
  foreignKey: 'organizzatoreClubId',
  as: 'organizzatore'
});

// Competizione -> Categorie (One-to-Many)
Competizione.hasMany(Categoria, {
  foreignKey: 'competizioneId',
  as: 'categorie',
  onDelete: 'CASCADE'
});
Categoria.belongsTo(Competizione, {
  foreignKey: 'competizioneId',
  as: 'competizione'
});

// Atleta -> Categorie (Many-to-Many attraverso IscrizioneAtleta)
Atleta.belongsToMany(Categoria, {
  through: IscrizioneAtleta,
  foreignKey: 'atletaId',
  otherKey: 'categoriaId',
  as: 'categorie'
});
Categoria.belongsToMany(Atleta, {
  through: IscrizioneAtleta,
  foreignKey: 'categoriaId',
  otherKey: 'atletaId',
  as: 'atleti'
});

// Associazioni dirette per IscrizioneAtleta
IscrizioneAtleta.belongsTo(Atleta, {
  foreignKey: 'atletaId',
  as: 'atleta'
});
IscrizioneAtleta.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria'
});

// Aggiunta associazione per Competizione
IscrizioneAtleta.belongsTo(Competizione, {
  foreignKey: 'competizioneId',
  as: 'competizione'
});
Competizione.hasMany(IscrizioneAtleta, {
  foreignKey: 'competizioneId',
  as: 'iscrizioni'
});
IscrizioneAtleta.belongsTo(ConfigTipoCategoria, {
  foreignKey: 'tipoCategoriaId',
  as: 'tipoCategoria'
});
ConfigTipoCategoria.hasMany(IscrizioneAtleta, {
  foreignKey: 'tipoCategoriaId',
  as: 'iscrizioni'
});

// IscrizioneAtleta -> ConfigEsperienza
IscrizioneAtleta.belongsTo(ConfigEsperienza, {
  foreignKey: 'idConfigEsperienza',
  as: 'esperienza'
});
ConfigEsperienza.hasMany(IscrizioneAtleta, {
  foreignKey: 'idConfigEsperienza',
  as: 'iscrizioni'
});

Atleta.hasMany(IscrizioneAtleta, {
  foreignKey: 'atletaId',
  as: 'iscrizioni'
});
Categoria.hasMany(IscrizioneAtleta, {
  foreignKey: 'categoriaId',
  as: 'iscrizioni'
});

// Giudice -> Categorie (Many-to-Many attraverso AssegnazioneGiudice)
Giudice.belongsToMany(Categoria, {
  through: AssegnazioneGiudice,
  foreignKey: 'giudiceId',
  otherKey: 'categoriaId',
  as: 'categorie'
});
Categoria.belongsToMany(Giudice, {
  through: AssegnazioneGiudice,
  foreignKey: 'categoriaId',
  otherKey: 'giudiceId',
  as: 'giudici'
});

// Associazioni dirette per AssegnazioneGiudice
AssegnazioneGiudice.belongsTo(Giudice, {
  foreignKey: 'giudiceId',
  as: 'giudice'
});
AssegnazioneGiudice.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria'
});

Giudice.hasMany(AssegnazioneGiudice, {
  foreignKey: 'giudiceId',
  as: 'assegnamenti'
});
Categoria.hasMany(AssegnazioneGiudice, {
  foreignKey: 'categoriaId',
  as: 'assegnamenti'
});

// ConfigTipoCompetizione -> ConfigTipoCategoria (One-to-Many)
ConfigTipoCompetizione.hasMany(ConfigTipoCategoria, {
  foreignKey: 'tipoCompetizioneId',
  as: 'tipiCategoria',
  onDelete: 'CASCADE'
});
ConfigTipoCategoria.belongsTo(ConfigTipoCompetizione, {
  foreignKey: 'tipoCompetizioneId',
  as: 'tipoCompetizione'
});

// ConfigTipoCategoria -> Categoria (One-to-Many)
ConfigTipoCategoria.hasMany(Categoria, {
  foreignKey: 'tipoCategoriaId',
  as: 'categorie',
  onDelete: 'RESTRICT'
});
Categoria.belongsTo(ConfigTipoCategoria, {
  foreignKey: 'tipoCategoriaId',
  as: 'tipoCategoria'
});

// ConfigTipoAtleta -> Atleta (One-to-Many)
ConfigTipoAtleta.hasMany(Atleta, {
  foreignKey: 'tipoAtletaId',
  as: 'atleti',
  onDelete: 'RESTRICT'
});
Atleta.belongsTo(ConfigTipoAtleta, {
  foreignKey: 'tipoAtletaId',
  as: 'tipoAtleta'
});

// ConfigTipoAtleta -> ConfigEsperienza (One-to-Many)
ConfigTipoAtleta.hasMany(ConfigEsperienza, {
  foreignKey: 'idConfigTipoAtleta',
  as: 'esperienze',
  onDelete: 'CASCADE'
});
ConfigEsperienza.belongsTo(ConfigTipoAtleta, {
  foreignKey: 'idConfigTipoAtleta',
  as: 'tipoAtleta'
});

// Club -> Competizioni (Many-to-Many attraverso IscrizioneClub)
Club.belongsToMany(Competizione, {
  through: IscrizioneClub,
  foreignKey: 'clubId',
  otherKey: 'competizioneId',
  as: 'competizioniIscritte'
});
Competizione.belongsToMany(Club, {
  through: IscrizioneClub,
  foreignKey: 'competizioneId',
  otherKey: 'clubId',
  as: 'clubsIscritti'
});

// Associazioni dirette per IscrizioneClub
IscrizioneClub.belongsTo(Club, {
  foreignKey: 'clubId',
  as: 'club'
});
IscrizioneClub.belongsTo(Competizione, {
  foreignKey: 'competizioneId',
  as: 'competizione'
});

Club.hasMany(IscrizioneClub, {
  foreignKey: 'clubId',
  as: 'iscrizioniCompetizioni'
});
Competizione.hasMany(IscrizioneClub, {
  foreignKey: 'competizioneId',
  as: 'iscrizioniClub'
});

// Esporta tutti i modelli e la connessione
module.exports = {
  sequelize,
  Club,
  Atleta,
  Giudice,
  Competizione,
  Categoria,
  IscrizioneAtleta,
  IscrizioneClub,
  AssegnazioneGiudice,
  UtentiLogin,
  ConfigTipoCompetizione,
  ConfigTipoCategoria,
  ConfigGruppoEta,
  ConfigTipoAtleta,
  ConfigEsperienza
};
