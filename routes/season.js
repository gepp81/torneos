var LIMIT = 20;
var ORDER = '-id'
var async = require('async');
var Engine = require('./engine/engine.js');

exports.getSeason = function(req, res, next) {
    async.parallel({
            seasons: function(callback) {
                var page = 1;
                if (req.params.page) {
                    page = req.params.page;
                }
                page = (page - 1) * LIMIT;
                req.models.Season.find().order(ORDER).limit(LIMIT).offset(page).run(function(err, seasons) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, seasons);
                });
            },
            total: function(callback) {
                req.models.Season.count(function(err, totalItems) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, totalItems);
                });
            }
        },
        function(err, results) {
            if (err) {
                res.status(500).send({
                    error: 'Cant get items.'
                });
            } else {
                res.status(200).send(results);
            }
        });
};

exports.get = function(req, res, next) {
    req.models.Season.get(req.params.id, function(err, season) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(season);
        }
    });
};

exports.createSeason = function(req, res, next) {
    var tournaments = req.body.tournaments;
    if (tournaments) {

        var configs = {};

        async.forEachOf(tournaments, function(value, key, callback) {
                req.models.Edition.find({
                    leagueName: value
                }).order(ORDER).limit(1).run(function(err, editionDb) {
                    if (err) return callback(err);
                    configs[value] = {
                        id: editionDb[0].id,
                        size: editionDb[0].size
                    };
                    callback();
                })
            },
            function(err) {
                if (err) {
                    req.status(500).send(err);
                } else {
                    var season = {
                        editions: configs,
                        week: 1
                    };
                    var max = 0;
                    for (var i in configs) {
                        var item = configs[i];
                        max = max < item.size ? item.size : max;
                    }
                    season.size = max;
                    req.models.Season.create(season, function(err, seasonDb) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send(err);
                        }
                    });
                }
            })
    }
}

exports.getRound = function(req, res, next) {
    var editions = req.body.editions;
    if (editions) {
        var configs = {};
        async.forEachOf(editions, function(value, key, callback) {
                req.models.Round.find({
                    edition: value.id,
                    number: req.body.week
                }).order('id').run(function(err, rounds) {
                    if (err) return callback(err);
                    configs[value.id] = {
                        rounds: rounds[0]
                    };
                    callback();
                })
            },
            function(err) {
                if (err) {
                    req.status(500).send(err);
                } else {
                    res.status(200).send(configs);
                }
            })
    }
}

exports.getPosition = function(req, res, next) {
    var editions = req.body.editions;
    if (editions) {
        var configs = {};
        async.forEachOf(editions, function(value, key, callback) {
                req.models.Position.find({
                    edition: value.id
                }).order('id').run(function(err, positions) {
                    if (err) return callback(err);
                    configs[value.id] = {
                        positions: positions
                    };
                    callback();
                })
            },
            function(err) {
                if (err) {
                    req.status(500).send(err);
                } else {
                    res.status(200).send(configs);
                }
            })
    }
}

function savePosition(position, goals, received) {
    position.games++;
    position.goals = parseInt(position.goals) + parseInt(goals);
    position.received = parseInt(position.received) + parseInt(received);
    if (goals < received) {
        position.lose++;
    } else if (goals > received) {
        position.win++;
    } else {
        position.tie++;
    }
    position.save(function(err) {
        if (err) throw err;
    });
}

function addPosition(req, gameDb) {
    req.models.Position.find({
        edition: req.body.edition,
        team: gameDb.home
    }, function(err, positions) {
        if (err) throw err;
        savePosition(positions[0], gameDb.homeGoals, gameDb.awayGoals);
    });
    req.models.Position.find({
        edition: req.body.edition,
        team: gameDb.away
    }, function(err, positions) {
        if (err) throw err;
        savePosition(positions[0], gameDb.awayGoals, gameDb.homeGoals);
    });
}

exports.playGame = function(req, res, next) {
    var gameId = req.body.id;
    req.models.Game.get(gameId, function(err, gameDb) {
        if (!gameDb.awayGoals && !gameDb.homeGoals) {
            req.models.Team.find({
                name: [gameDb.home, gameDb.away]
            }, function(err, teams) {
                var engine = new Engine(gameDb, teams);
                var result = engine.playGame();
                gameDb.awayGoals = result.awayGoals;
                gameDb.homeGoals = result.homeGoals;
                gameDb.save(function(err) {
                    if (err) throw err;
                    addPosition(req, gameDb);
                    res.status(200).send(gameDb);
                });
            });
        }
    });
}