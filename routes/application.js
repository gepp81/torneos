var PROPERTIES = require('./properties.js');
var STATUS = PROPERTIES.STATUS;
var Engine = require('./engine/engine.js');
var orm = require('orm');
var async = require('async');

function changeStatusEditions(req, res, next, seasonDb) {
    var item;
    async.forEachOf(seasonDb.editions, function(value, key, callback) {
        req.models.Edition.get(value.id, function(err, editionDb) {
            if (err) {
                callback(err);
            } else {
                editionDb.status = STATUS.PLAYING;
                editionDb.save(function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                })
            }
        });
    }, function(err){
        if (err) {
            next(err);
        } else {
            res.status(200).send();
        }
    });

};

exports.savePlaySeason = function(req, res, next) {
    
    // TODO: cuando inicio la temporada tengo que actualizar las ediciones para decir que estan jugando esas ediciones.
    // TODO 2: cuando finalizo una temporada finalizo las ediciones.
    
    req.models.Season.find({
        status: STATUS.PLAYING
    }, function(err, seasonsDb) {
        if (err) {
            next(err);
        } else {
            if (seasonsDb.length == 0) {
                req.models.Season.get(req.body.season.id, function(err, seasonDb) {
                    if (err) next(err);
                    seasonDb.status = STATUS.PLAYING;
                    seasonDb.save(seasonDb, function(err) {
                        req.models.Application.get(1, function(err, appDb) {
                            appDb.season = req.body.season.id;
                            appDb.save(function(err) {
                                if (err) {
                                    next(err);
                                } else {
                                    changeStatusEditions(req, res, next, seasonDb);
                                }
                            })
                        });
                    });
                });
            } else {
                next(new Error("Hay otra temporada en juego."));
            }
        }
    });
}

exports.getApplication = function(req, res, next) {
    req.models.Application.get(1, function(err, appDb) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(appDb);
        }
    });
}

exports.finalizeSeason = function(req, res, next) {
    req.models.Application.get(1, function(err, app) {
        app.season = null;
        app.save(function(err) {
            if (err) {
                next(err);
            } else {
                req.models.Season.find({
                    id: req.body.season
                }, function(err, seasonDb) {
                    if (err) {
                        next(err);
                    } else {
                        seasonDb[0].status = PROPERTIES.FINALIZED;
                        seasonDb[0].save(function(err) {
                            res.status(200).send();
                        })
                    }
                });
            }
        });
    });
}

exports.testEngine = function(req, res, next) {
    var home = {
        name: "home",
        skill: "8,8,8,8,8,8,8,8,8,8"
    }
    var away = {
        name: "away",
        skill: "8,8,8,8,8,8,8,8,8,8"
    }
    var game = {
        home: home,
        away: away
    };
    var teams = [];
    teams.push(home);
    teams.push(away);
    var homeWins = 0;
    var awayWins = 0;
    var goalsHome = 0;
    var goalsAway = 0;
    var ties = 0;
    for (var i = 100; i > 0; i--) {
        var engine = new Engine(game, teams);
        var result = engine.playGame();
        if (result.homeGoals > result.awayGoals) {
            homeWins++;
        } else if (result.homeGoals < result.awayGoals) {
            awayWins++;
        } else {
            ties++;
        }
        goalsAway = parseInt(result.awayGoals) + goalsAway;
        goalsHome = parseInt(result.homeGoals) + goalsHome;
    }

    var result = {
        home: homeWins,
        away: awayWins,
        ties: ties,
        goalsHome: goalsHome,
        goalsAway: goalsAway
    };
    res.status(200).send(result);

}