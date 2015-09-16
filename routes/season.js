var LIMIT = 20;
var ORDER = '-id'
var async = require('async');
var Engine = require('./engine/engine.js');

exports.getSeason = function(req, res, next) {
    async.parallel({
            seasons: function(callback) {
                var page = req.params.page ? req.params.page : 1;
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
                        size: editionDb[0].size,
                        startWeek: editionDb[0].startWeek,
                        double: editionDb[0].double,
                        type: editionDb[0].type
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
                        max = max < item.size + item.startWeek - 1 ? item.size + item.startWeek - 1 : max;
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
                    number: req.body.week - value.startWeek + 1
                }).order('number').run(function(err, rounds) {
                    if (err) return callback(err);
                    configs[value.id] = {
                        rounds: rounds[0],
                        double: value.double
                    };
                    callback();
                })
            },
            function(err) {
                if (err) {
                    res.status(500).send(err);
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
    var final = req.body.final;
    var double = req.body.double;
    var number = req.body.number;
    var edition = req.body.edition;
    req.models.Game.get(gameId, function(err, gameDb) {
        if (!gameDb.awayGoals && !gameDb.homeGoals) {
            async.parallel({
                    teams: function(callback) {
                        req.models.Team.find({
                            name: [gameDb.home, gameDb.away]
                        }, function(err, teams) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null, teams);
                        });
                    },
                    lastGame: function(callback) {
                        if (double && final) {
                            req.models.Round.find({
                                number: parseInt(number - 1),
                                edition: edition
                            }, function(err, roundDb) {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                var games = roundDb[0].games;
                                for (var key in games) {
                                    var game = games[key];
                                    if (game.away == gameDb.home && game.home == gameDb.away) {
                                        callback(null, game);
                                        return;
                                    }
                                }
                            });
                        } else {
                            callback(null, false);
                        }
                    }
                },
                function(err, results) {
                    var engine = new Engine(gameDb, results.teams);
                    engine.setFinal(final);
                    engine.setDouble(double);
                    if (double && final) {
                        engine.setLastGame(results.lastGame);
                    }
                    updateGame(req, res, gameDb, engine.playGame());
                }
            );
        }
    });
};


var comparePosition = function(one, second) {

    if (one.points == second.points) {
        if ((one.goals - one.received) == (second.goals - second.received)) {
            if (one.goals == second.goals) {
                return one.valueSum < second.valueSum ? 1 : -1;
            } else {
                return one.goals < second.goals ? 1 : -1;
            }
        } else {
            return (one.goals - one.received) < (second.goals - second.received) ? 1 : -1;
        }
    } else {
        return one.points < second.points ? 1 : -1;
    }
}

var definePositions = function(req, res, positionDb) {
    positionDb.sort(comparePosition);

    var i = 1;
    async.eachSeries(positionDb, function(value, callback) {
        value.final = i;
        value.save(function(err) {});
        i++;
        callback();
    }, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(positionDb);
        }
    });
}

exports.definePosition = function(req, res, next) {
    var edition = req.body.edition;
    req.models.Position.find({
        edition: edition
    }, function(err, positionsDb) {
        var teams = new Array();
        async.eachSeries(positionsDb, function(value, callback) {
                req.models.Team.find({
                    name: value.team
                }, function(err, teamDb) {
                    if (err) return callback(err);

                    var skills = teamDb[0].skill.split(",");
                    var sum = 0;
                    for (var i = 0; i < skills.length; i++) {
                        sum = sum + parseInt(skills[i]);
                    }
                    var calculateValue = Math.floor(Math.random() * 100) + sum;

                    while (teams.indexOf(value) != -1) {
                        calculateValue = Math.floor(Math.random() * 100) + sum;
                    }
                    value.valueSum = calculateValue;
                    callback();
                })
            },
            function(err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    definePositions(req, res, positionsDb);
                }
            })
    });
}

exports.saveWeek = function(req, res, next) {
    req.models.Season.get(req.body.id, function(err, seasonDb) {
        seasonDb.week = req.body.week;
        seasonDb.save(function(err) {
            res.status(200).send();
        });
    });
}

function updateGame(req, res, gameDb, result) {
    gameDb.awayGoals = result.awayGoals;
    gameDb.homeGoals = result.homeGoals;
    gameDb.save(function(err) {
        if (err) throw err;
        addPosition(req, gameDb);
        gameDb.winner = result.winner;

    });
}

exports.playGames = function(req, res, next) {
    var final = req.body.final;
    var double = req.body.double;
    var number = req.body.number;
    var edition = req.body.edition;
    var winners = new Array();
    req.models.Round.find({
        edition: edition,
        number: number
    }, function(err, roundDb) {
        async.eachSeries(roundDb[0].games, function(value, callback) {
                if (!value.awayGoals && !value.homeGoals) {
                    async.parallel({
                            teams: function(callback) {
                                req.models.Team.find({
                                    name: [value.home, value.away]
                                }, function(err, teams) {
                                    if (err) {
                                        callback(err);
                                        return;
                                    }
                                    callback(null, teams);
                                });
                            },
                            lastGame: function(callback) {
                                if (double && final) {
                                    req.models.Round.find({
                                        number: parseInt(number - 1),
                                        edition: edition
                                    }, function(err, roundDbLast) {
                                        if (err) {
                                            callback(err);
                                            return;
                                        }
                                        var games = roundDbLast[0].games;
                                        for (var key in games) {
                                            var game = games[key];
                                            if (game.away == value.home && game.home == value.away) {
                                                callback(null, game);
                                                return;
                                            }
                                        }
                                    });
                                } else {
                                    callback(null, false);
                                }
                            }
                        },
                        function(err, results) {
                            var engine = new Engine(value, results.teams);
                            engine.setFinal(final);
                            engine.setDouble(double);
                            if (double && final) {
                                engine.setLastGame(results.lastGame);
                            }
                            var result = engine.playGame();
                            winners.push(result.winner);
                            updateGame(req, res, value, result);
                            callback();
                        }
                    );
                } else {
                    res.status(500).send({});
                }
            },
            function(err) {
                if (!final) {
                    res.status(200).send({});
                } else {
                    if (winners.length > 0) {
                        generateNextRound(req, res, winners, edition, number, double);
                    }
                }
            }
        );
    })
};

function generateNextRound(req, res, winners, edition, number, double) {
    var number = number + 1;

    req.models.Position.find({
        edition: edition,
        team: winners
    }, function(err, positionsDb) {
        for (var i in positionsDb) {
            var position = positionsDb[i];
            position.final--;
            position.save(function(err) {

            });
        }
    });


    req.models.Round.find({
            edition: edition,
            number: parseInt(number)
        },
        function(err, roundDb) {
            if (roundDb.length > 0) {
                var gamesDb = roundDb[0].games;
                for (var i = 0; i < gamesDb.length; i = i + 2) {
                    gamesDb[i].home = winners[i];
                    gamesDb[i].away = winners[i + 1];
                }

                for (var key in gamesDb) {
                    var gameDb = gamesDb[key];

                    gameDb.save(function(err) {

                    })
                }

                if (double) {
                    number = number + 1;
                    req.models.Round.find({
                            edition: edition,
                            number: parseInt(number)
                        },
                        function(err, roundDb) {
                            if (roundDb.length > 0) {
                                var gamesDb = roundDb[0].games;
                                for (var i = 0; i < gamesDb.length; i = i + 2) {
                                    gamesDb[i].home = winners[i + 1];
                                    gamesDb[i].away = winners[i];
                                }
                                for (var key in gamesDb) {
                                    var gameDb = gamesDb[key];
                                    gameDb.save(function(err) {

                                    })
                                }
                            }
                            res.status(200).send();
                        });
                } else {
                    res.status(200).send();
                }
            } else {
                res.status(200).send();
            }
        });
}