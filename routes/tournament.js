var LIMIT = 20;
var TEAM = "team";
var ORDER_NAME_ASC = 'name';
var ORDER_NUMBER_ASC = 'number';
var ORDER_ID_DESC = '-id';
var ORDER_COUNT_DESC = '-count';
var RoundFactory = require("./factory/round.js");
var async = require('async');
var orm = require('orm');
var PROPERTIES = require('./properties.js');
var STATUS = PROPERTIES.STATUS;

var EDITION_LEAGUE = "LEAGUE";
var EDITION_CUP = "CUP";


/**
 * Crea un nuevo torneo
 */
exports.create = function(req, res, next) {
    var tournament = req.body.tournament;
    if (tournament && tournament.name) {
        tournament.editionPlayed = 0;
        tournament.editionNumber = 0;
        req.models.Tournament.create(tournament, function(err, tournamentDb) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(tournamentDb);
            }
        });
    } else {
        next(new Error("No se definio un torneo."));
    }
};

/**
 * Recupera un torneo
 */
exports.get = function(req, res, next) {
    req.models.Tournament.get(req.params.id, function(err, tournamentDb) {
        if (err) {
            next(new Error("error pq no definio un tournament"));
        } else {
            res.status(200).send(tournamentDb);
        }
    });
};

/**
 * Recupera todos los torneos sin paginar. PAra Autocomplete
 */
exports.getAll = function(req, res, next) {
    
    req.models.db.driver.execQuery("SELECT tournament.* FROM tournament WHERE EXISTS (SELECT * from edition WHERE edition.league = tournament.id AND edition.status = 'Sin Empezar')",
        function(err, tournaments) {
            if (err) {
                next(err);
                return;
            }
            res.status(200).send(tournaments);
        });

    /*
    req.models.Tournament.find().order(ORDER_NAME_ASC).run(function(err, tournaments) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(tournaments);
        }
    });*/
};

/**
 * Recupera los torneos paginados
 */
exports.getAllPage = function(req, res, next) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = (page - 1) * LIMIT;
    async.parallel({
        tournaments: function(callback) {
            req.models.Tournament.find().order(ORDER_NAME_ASC).limit(LIMIT).offset(page).run(function(err, tournaments) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, tournaments);
                }
            });
        },
        total: function(callback) {
            req.models.Tournament.find().count(function(err, total) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, total);
                }
            });
        }
    }, function(err, results) {
        if (err) {
            next(new Error("error pq no definio un tournament"));
        } else {
            res.status(200).send(results);
        }
    });

};

/**
 * Actualiza un torneo
 */
exports.update = function(req, res, next) {
    var tournament = req.body.tournament;
    if (tournament && tournament.name && tournament.id) {
        req.models.Tournament.get(tournament.id, function(err, tournamentDb) {
            if (err) {
                next(new Error("errorrrr pq no definio un tournament"));
            } else {
                tournamentDb.save(tournament, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).send(tournamentDb);
                    }
                });
            }
        });
    } else {
        next(new Error("errorrrr pq no definio un tournament"));
    }
}

/**
 * Crea el fixture para la edicion y actualiza el torneo
 */
function setupEdition(req, res, tournamentDb, editionDb) {
    var double = req.body.double ? true : false;
    async.parallel({
            one: function(callback) {
                var factory = new RoundFactory(editionDb, double);

                async.each(factory.getFixture(), function(item, callback) {
                    req.models.Round.create(item, function(err, itemDb) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, true);
                        }
                    });
                }, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, true);
                    }
                });
            },
            two: function(callback) {
                tournamentDb.editionPlayed = editionDb.id;
                tournamentDb.editionNumber = parseInt(tournamentDb.editionNumber) + 1;
                tournamentDb.save(function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, true);
                    }
                });
            }
        },
        function(err, results) {
            console.log(results);
            if (results.one && results.two) {
                res.status(200).send({})
            } else {
                res.status(500).send({})
            }
        });
}

/**
 * Crea las posiciones vacias para la edicion
 */
function createNewPosition(req, editionDb) {
    var length = editionDb.teams.length;
    for (var i = length - 1; i >= 0; i--) {
        var position = {
            edition: editionDb.id,
            league: editionDb.league,
            team: editionDb.teams[i],
            games: 0,
            win: 0,
            tie: 0,
            lose: 0,
            goals: 0,
            received: 0
        }
        if (editionDb.type === EDITION_CUP) {
            position.final = length;
        }
        req.models.Position.create(position, function(err, positionDb) {});
    }
}

/**
 * Crea una edicion para un torneo dado
 */
function createLeagueEdition(edition, req, res, next, tournamentDb) {
    if (edition.type === EDITION_LEAGUE) {
        edition.size = req.body.double ? (edition.teams.length - 1) * 2 : (edition.teams.length - 1);
    }
    if (edition.type === EDITION_CUP) {
        var count = 1;
        while (Math.pow(2, count) < edition.teams.length) {
            count++;
        }
        edition.size = req.body.double ? count * 2 : count;
    }
    if (edition.teams.length >= 2) {
        req.models.Edition.find({
            status: [STATUS.PLAYING, STATUS.NOT_STARTED],
            league: tournamentDb.id
        }, function(err, editionExists) {
            if (err) {
                next(err);
            } else {
                if (editionExists.length > 0) {
                    next(new Error("Ya existe una edicion en juego de este torneo"));
                } else {
                    req.models.Edition.create(edition, function(err, editionDb) {
                        if (err) {
                            next(err);
                        } else {
                            createNewPosition(req, editionDb);
                            setupEdition(req, res, tournamentDb, editionDb);
                        }
                    });
                }
            }
        })
    } else {
        next(new Error("Cantidad de equipos erronea"));
    }
}

/**
 * Agrega una edicion a un torneo
 */
exports.addEdition = function(req, res, next) {
    var tournament = req.body.tournament;
    var edition = req.body.edition;

    req.models.Tournament.get(tournament.id, function(err, tournamentDb) {
        if (err) {
            next(new Error("errorrrr pq no definio un tournament"));
        } else {
            edition.league = tournamentDb.id;
            edition.leagueName = tournamentDb.name;
            edition.playing = 1;
            edition.double = req.body.double;
            createLeagueEdition(edition, req, res, next, tournamentDb);
        }
    });
}

/**
 * Recupera las ediciones para un torneo de manera paginada (TODO)
 */
exports.getEditions = function(req, res, next) {
    req.models.Edition.find({
        league: req.params.tournament
    }).order(ORDER_ID_DESC).run(function(err, editions) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(editions);
        }
    })
}

/**
 * Recuper la ultima edicion de un torneo
 */
exports.getLastEdition = function(req, res, next) {
    req.models.Edition.find({
        league: req.params.tournament,
        id: req.params.lastEdition
    }, function(err, edition) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(edition[0]);
        }
    })
}

/**
 * Recupera el fixture de una edicion
 */
exports.getFixture = function(req, res, next) {
    req.models.Round.find({
        edition: req.params.edition
    }).order(ORDER_NUMBER_ASC).run(function(err, rounds) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(rounds);
        }
    })
}

/**
 * Devuelve los campeones de un torneo
 */
exports.championByTour = function(req, res, next) {
    req.models.db.driver.execQuery("SELECT position.team, count(*) AS count" +
        " FROM position INNER JOIN edition edi ON position.edition = edi.id WHERE final = 1 " +
        "AND edi.status = ? AND edi.league = ? GROUP BY position.team ORDER BY count DESC", [STATUS.FINALIZED, req.params.tournament],
        function(err, positions) {
            if (err) {
                next(err);
                return;
            }
            res.status(200).send(positions);
        });
}

/**
 * Devuelve los campeones y sus títulos.
 */
exports.champions = function(req, res, next) {
    req.models.db.driver.execQuery("SELECT position.team, GROUP_CONCAT(edi.leagueName SEPARATOR ', ') tournaments, count(*) " +
        "AS total FROM position INNER JOIN edition edi ON position.edition = edi.id WHERE final = 1 " +
        "AND edi.status = ? GROUP BY position.team ORDER BY total DESC", [STATUS.FINALIZED],
        function(err, positions) {
            if (err) {
                next(err);
                return;
            }
            res.status(200).send(positions);
        });
}

/**
 * Devuelve el total de puntos conseguidos por los participantes en las ligas.
 */
exports.pointsByTour = function(req, res, next) {
    req.models.db.driver.execQuery(
        "SELECT team, sum(win) AS wins, sum(tie) AS ties FROM position WHERE league = ? GROUP BY team", req.params.tournament,
        function(err, positions) {
            res.status(200).send(positions);
        });

}