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
        teams: Object
    });

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
    });

    models.Round.hasMany('games', models.Game, {}, {
        autoFetch: true,
        autoSave: true,
        cache: false
    });

    /*    models.User.hasMany("permissions", models.Permission, {}, {
            autoFetch: true
        });*/

    models.Tournament = db.define("tournament", {
        id: 'serial',
        name: {
            type: 'text',
            required: true,
            unique: true
        },
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
        editions: Object
    })

    // Sincronize db ONLY FOR FIRST
    /*db.drop(function() {
        // dropped all tables from defined models (Person and Pet)

        db.sync(function() {
            // created tables for Person model
        });
    });*/
};