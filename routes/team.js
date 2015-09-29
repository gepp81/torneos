var async = require("async");
var PROPERTIES = require('./properties.js');
var ORDER = PROPERTIES.ORDER, TEAM = PROPERTIES.TEAM;

/**
 * Crea un nuevo equipo
 */
exports.create = function(req, res, next) {
    var team = req.body.team;
    if (team && team.name) {
        var skill = team.skill.split(TEAM.SPLITTER);
        if (skill.length == TEAM.LENGTH) {
            req.models.Team.create(team, function(err, teamDb) {
                if (err) {
                    next(err);
                }
                res.status(200).send(teamDb);
            });
        } else {
            throw new Error("No hay 10 skills");
        }
    } else {
        throw new Error("No se definio un equipo");
    }
};

/**
 * Recupera un equipo por id o name
 */
exports.get = function(req, res, next) {
    if (req.params.id) {
        req.models.Team.get(req.params.id, function(err, teamDb) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(teamDb);
            }
        });
    } else {
        req.models.Team.find({
                name: req.params.name
            },
            function(err, teamDb) {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send(teamDb[0]);
                }
            });
    }
};

/**
 * Recupera todos los equipos para el autocomplete
 */
exports.getAllTeams = function(req, res, next) {
    req.models.Team.find({}, function(err, teams) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(teams);
        }
    });
};

/**
 * Recupera los equipos paginados
 */
exports.getAll = function(req, res, next) {
    async.parallel({
            teams: function(callback) {
                var page = 1;
                var limit = parseInt(req.params.size);
                if (req.params.page) {
                    page = req.params.page;
                }
                page = (page - 1) * limit;
                console.log(req.params.size);
                req.models.Team.find().order(ORDER.NAME).limit(limit).offset(page).run(function(err, teams) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, teams);
                });
            },
            total: function(callback) {
                req.models.Team.count(function(err, totalItems) {
                    if (err) {
                        callback(err);
                    }
                    callback(null, totalItems);
                });
            }
        },
        function(err, results) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(results);
            }
        })
};

/**
 * Actuakliza un equipo
 */
exports.update = function(req, res, next) {
    var team = req.body.team;
    if (team && team.name && team.id) {
        var skill = team.skill.split(TEAM.SPLITTER);
        if (skill.length == TEAM.LENGTH) {
            req.models.Team.get(team.id, function(err, teamDb) {
                if (err) {
                    next(new Error("errorrrr pq no definio un team"));
                } else {
                    teamDb.save(team, function(err) {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).send(teamDb);
                        }
                    });
                }
            });
        } else {
            next(new Error("No definio un equipo."));
        }
    }
}