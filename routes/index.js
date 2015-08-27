var express = require('express');
var pathFunctions = require('path');
var routesTeam = require('./team.js');
var routesTournament = require('./tournament.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(pathFunctions.join(__dirname, '..', 'public', 'views', '/index.html'));
});

router.post('/team', routesTeam.create);
router.put('/team', routesTeam.update);
router.get('/team', routesTeam.getAllTeams);
router.get('/team/:id', routesTeam.get);
router.get('/team/getAll/:page', routesTeam.getAll);

router.post('/tournament', routesTournament.create);
router.put('/tournament', routesTournament.update);
router.get('/tournament/:id', routesTournament.get);
router.get('/tournament/getAll/:page', routesTournament.getAll);

router.post('/edition', routesTournament.addEdition);
router.get('/edition/:tournament', routesTournament.getEditions);
router.get('/fixture/:edition', routesTournament.getFixture);

module.exports = router;