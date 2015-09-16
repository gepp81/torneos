var LIMIT = 20;
var ORDER = 'name';
var async = require("async");

exports.create = function(req, res, next) {
    var team = req.body.team;
    if (team && team.name) {
        var skill = team.skill.split(",");
        if (skill.length == 10) {
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

exports.getAllTeams = function(req, res, next) {
    req.models.Team.find({}, function(err, teams) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(teams);
        }
    });
};

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
                req.models.Team.find().order(ORDER).limit(limit).offset(page).run(function(err, teams) {
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

exports.update = function(req, res, next) {
    var team = req.body.team;
    if (team && team.name && team.id) {
        var skill = team.skill.split(",");
        if (skill.length == 10) {
            req.models.Team.get(team.id, function(err, teamDb) {
                if (err) {
                    res.status(500).send("errorrrr pq no definio un team");
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
            throw new Error("No definio un equipo.");
        }
    }
}