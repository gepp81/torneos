var express = require('express');
var pathFunctions = require('path');
var routesTeam = require('./team.js');
var routesTournament = require('./tournament.js');
var routesSeason = require('./season.js');
var routesApplication = require('./application.js');

var router = express.Router();

//var transaction = require("orm-transaction");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(pathFunctions.join(__dirname, '..', 'public', 'views', '/index.html'));
});


/** Example transaction **/
/*
var cb0 = function(req, res, next) {
    req.models.db.use(transaction);
    req.models.db.transaction(function (err, t) {
        req.t = t;
        next();    
    });
    
}

var cb1 = function(req, res, next) {
    var obj = {name:"AAAbc", skill: 'fffffffffff2'};
    delete obj.skil;
    obj.skill = "aaaaa";
    
    req.models.Application.create({}, function(err, appDb) {
        
    });
    
    req.models.Team.create(obj, function(err, teamDb) {
         if (err) req.errDb = err;
         req.result = teamDb;
         next();
    });
}

var cb2 = function(req, res, next) {
    if (req.errDb) {
            console.log("tengo q rool");    
            req.t.rollback(function(err){
            console.log("rool");    
            });
            next(req.errDb);
    } else {
        req.t.commit(function(err){
            console.log("commit");
          res.status(200).send(req.result);
        });
    }
}


router.get('/test', [cb0, cb1, cb2]);
*/
/** end example **/

router.post('/application', routesApplication.savePlaySeason);
router.get('/application', routesApplication.getApplication);
router.put('/application', routesApplication.finalizeSeason);

router.get('/testEngine', routesApplication.testEngine);

router.post('/team', routesTeam.create);
router.put('/team', routesTeam.update);
router.get('/team', routesTeam.getAllTeams);
router.get('/team/:id', routesTeam.get);
router.get('/team/getAll/:page/:size', routesTeam.getAll);

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
router.post('/finalizeSeason', routesApplication.finalizeSeason);

router.post('/round', routesSeason.getRound);

router.get('/position/:number/:tournament', routesSeason.getPositionByTournament);
router.post('/position', routesSeason.getPositions);
router.put('/position', routesSeason.definePosition);

router.post('/game', routesSeason.playGame);
router.put('/game', routesSeason.playGames);

router.get('/champions/:tournament/:lastEdition', routesTournament.championByTour);
router.post('/champions', routesTournament.champions);
router.get('/historyPoints/:tournament', routesTournament.pointsByTour);

module.exports = router;