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

exports.playGame = function(req, res, next) {
    var gameId = req.body.id;
    req.models.Game.get(gameId, function(err, gameDb) {
        console.log("game" + gameDb.id);
        console.log("game" + gameDb.away);        
        console.log("game" + gameDb.home);
        req.models.Team.find({
            name: [gameDb[0].home, gameDb.away]
        }, function(err, teams) {
            var engine = new Engine(gameDb, teams);
            engine.playGame();
            gameDb.save(function(err) {
            });
        });
    });
}