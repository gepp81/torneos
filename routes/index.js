var express = require('express');
var pathFunctions = require('path');
var routesTeam = require('./team.js');
var routesTournament = require('./tournament.js');
var routesSeason = require('./season.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(pathFunctions.join(__dirname, '..', 'public', 'views', '/index.html'));
});

router.post('/application', function(req, res, next) {
    req.models.Season.get(req.body.season.id, function(err, seasonDb) {
        if (err) throw err;
        seasonDb.status = "Jugando";
        seasonDb.save(seasonDb, function(err) {
            req.models.Application.get(1, function(err, appDb) {
                if (err) {
                    var app = {};
                    app.season = req.body.season.id;
                    req.models.Application.create(app, function(err, appDb) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send();
                        }
                    });
                } else {
                    appDb.season = req.body.season.id;
                    appDb.save(function(err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send();
                        }
                    })
                }
            });
        });
    });

});

router.get('/application', function(req, res, next) {
    req.models.Application.get(1, function(err, appDb) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(appDb);
        }
    });
});

router.post('/team', routesTeam.create);
router.put('/team', routesTeam.update);
router.get('/team', routesTeam.getAllTeams);
router.get('/team/:id', routesTeam.get);
router.get('/team/getAll/:page', routesTeam.getAll);

router.post('/tournament', routesTournament.create);
router.put('/tournament', routesTournament.update);
router.get('/tournament/:id', routesTournament.get);
router.get('/tournaments/getAll/:page', routesTournament.getAllPage);
router.get('/tournaments/getAll/', routesTournament.getAll);

router.post('/edition', routesTournament.addEdition);
router.get('/edition/:tournament', routesTournament.getEditions);
router.get('/edition/:tournament/:lastEdition', routesTournament.getLastEdition);
router.get('/fixture/:edition', routesTournament.getFixture);

router.get('/seasons/:page', routesSeason.getSeason);
router.get('/season/:id', routesSeason.get);
router.put('/season', routesSeason.saveWeek);
router.post('/season', routesSeason.createSeason);
router.post('/round', routesSeason.getRound);
router.post('/position', routesSeason.getPosition);
router.put('/position', routesSeason.definePosition);
router.post('/game', routesSeason.playGame);
router.put('/game', routesSeason.playGames);

module.exports = router;