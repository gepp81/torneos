module.exports = function(db, models) {

    models.Team = db.define("team", {
        id: 'serial',
        name: {
            type: 'text',
            required: true,
            unique: true
        },
        skill: {
            type: 'text',
            required: true
        }
    });

    models.Edition = db.define("edition", {
        id: 'serial',
        league: 'integer',
        leagueName: 'text',
        teams: Object,
        size: 'integer',
        playing: 'integer',
        type: 'text',
        double: 'boolean',
        startWeek: 'integer'
    });

    models.Position = db.define("position", {
        id: 'serial',
        league: 'integer',
        edition: 'integer',
        team: String,
        games: 'integer',
        win: 'integer',
        tie: 'integer',
        lose: 'integer',
        goals: 'integer',
        received: 'integer',
        final: 'integer'
    })

    models.Game = db.define('game', {
        id: 'serial',
        home: 'text',
        away: 'text',
        homeGoals: {
            type: 'integer',
            defaultValue: null
        },
        awayGoals: {
            type: 'integer',
            defaultValue: null
        }
    });

    models.Round = db.define('round', {
        id: 'serial',
        edition: 'integer',
        number: 'integer',
        final: {
            type: 'boolean',
            defaultValue: false
        }
    });

    models.Round.hasMany('games', models.Game, {}, {
        autoFetch: true,
        autoSave: true,
        cache: false
    });

    models.Tournament = db.define("tournament", {
        id: 'serial',
        name: {
            type: 'text',
            required: true,
            unique: true
        },
        editionNumber: String,
        editionPlayed: String
    });

    models.Season = db.define("season", {
        id: 'serial',
        number: 'integer',
        status: {
            type: "enum",
            values: ["Sin Empezar", "Jugando", "Finalizada"],
            defaultValue: "Sin Empezar"
        },
        size: 'integer',
        week: 'integer',
        editions: Object
    });

    models.Application = db.define("application", {
        season: 'integer'
    });
    
    models.db = db;

    // Sincronize db ONLY FOR FIRST
    /*db.drop(function() {
        db.sync(function() {
        });
    });*/
};