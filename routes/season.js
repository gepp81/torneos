var LIMIT = 20;
var ORDER = '-id'
var async = require('async');

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

/*
exports.get = function(req, res, next) {
    req.models.Tournament.get(req.params.id, function(err, tournamentDb) {
        if (err) {
            res.status(500).send("errorrrr pq no definio un tournament");
        } else {
            res.status(200).send(tournamentDb);
        }
    });
};

exports.getAll = function(req, res, next) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = (page - 1) * LIMIT;
    req.models.Tournament.find().order(ORDER).limit(LIMIT).offset(page).run(function(err, tournaments) {
        if (err) {
            res.status(500).send("errorrrr pq no definio un tournament");
        } else {
            res.status(200).send({
                tournaments: tournaments,
                total: 20
            });
        }
    });
};

exports.update = function(req, res, next) {
    var tournament = req.body.tournament;
    if (tournament) {
        var error = false;
        if (!tournament.name || !tournament.id) {
            error = true;
        }
        if (!error) {
            req.models.Tournament.get(tournament.id, function(err, tournamentDb) {
                if (err) {
                    res.status(500).send("errorrrr pq no definio un tournament");
                } else {
                    tournamentDb.save(tournament, function(err) {
                        if (err) {
                            res.status(500).send({
                                error: 'Error to update the value.'
                            });
                        } else {
                            res.status(200).send(tournamentDb);
                        }
                    });

                }
            });
        } else {
            res.status(500).send("errorrrr pq no definio un tournament");
        }
    }
}

function setupEdition(req, res, tournamentDb, editionDb) {
    async.parallel({
            one: function(callback) {
                var factory = new RoundFactory(editionDb, true);

                async.each(factory.getFixture(), function(item, callback) {
                    req.models.Round.create(item, function(err, itemDb) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log(itemDb);
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

exports.addEdition = function(req, res, next) {
    var tournament = req.body.tournament;
    var edition = req.body.edition;

    req.models.Tournament.get(tournament.id, function(err, tournamentDb) {
        if (err) {
            res.status(500).send("errorrrr pq no definio un tournament");
        } else {
            edition.league = tournamentDb.id;
            req.models.Edition.create(edition, function(err, editionDb) {
                if (err) {
                    res.status(500).send({
                        error: 'Error to update the value.'
                    });
                } else {
                    setupEdition(req, res, tournamentDb, editionDb);
                }
            });
        }
    });
}

exports.getEditions = function(req, res, next) {
    req.models.Edition.find({
        league: req.params.tournament
    }).order("-id").run(function(err, editions) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(editions);
        }
    })
}

exports.getFixture = function(req, res, next) {
    req.models.Round.find({
        edition: req.params.edition
    }, function(err, rounds) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(rounds);
        }
    })
}*/