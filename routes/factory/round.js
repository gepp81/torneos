var PROPERTIES = require('../properties.js');

module.exports = function RoundFactory(edition, double) {

    this.teams = edition.teams;
    this.double = double;
    this.edition = edition.id;
    this.type = edition.type;

    function changeTeamsPosition(teams) {
        for (var i = 0; i < teams.length; i = i + 2) {
            var temp = teams[i];
            teams[i] = teams[i + 1];
            teams[i + 1] = temp;
        }
        return teams;
    }

    function setNumber(finalFix) {
        for (var i = 0; i < finalFix.length; i++) {
            var elem = finalFix[i];
            elem.number = i + 1;
        }
        return finalFix;
    }

    function concatRounds(first, second) {
        var finalFix = first.concat(second);
        return setNumber(finalFix);
    }

    /**
     * Fixture para copas
     */

    this.cup2Round = function(fix, team1, team2) {
        var round = get2Round(this.edition, team1, team2);
        round.final = !this.double;
        fix.push(round);
        console.log(this.double);
        if (this.double) {
            round = get2Round(this.edition, team2, team1);
            round.final = true;
            fix.push(round);
        }
        return fix;
    }

    this.cup4Round = function(fix, team1, team2, team3, team4) {
        var round = get4Round(this.edition, team1, team2, team3, team4);
        fix.push(round);
        round.final = !this.double;
        if (this.double) {
            round = get4Round(this.edition, team2, team1, team4, team3);
            round.final = true;
            fix.push(round);
        }
        fix = this.cup2Round(fix, null, null);
        return fix;
    }

    this.cup8Round = function(fix, team1, team2, team3, team4, team5, team6, team7, team8) {
        var round = get8Round(this.edition, team1, team2, team3, team4, team5, team6, team7, team8);
        fix.push(round);
        round.final = !this.double;
        if (this.double) {
            round = get8Round(this.edition, team2, team1, team4, team3, team6, team5, team8, team7);
            round.final = true;
            fix.push(round);
        }
        fix = this.cup4Round(fix, null, null, null, null);
        return fix;
    }

    this.cup16Round = function(fix, teams) {
        var round = get8Round(this.edition, teams[0], teams[1], teams[2], teams[3], teams[4], teams[5], teams[6], teams[7]);
        var roundSecond = get8Round(this.edition, teams[8], teams[9], teams[10], teams[11], teams[12], teams[13], teams[14], teams[15]);
        round.games = round.games.concat(roundSecond.games);
        fix.push(round);
        round.final = !this.double;
        if (this.double) {
            round = get8Round(this.edition, teams[1], teams[0], teams[3], teams[2], teams[5], teams[4], teams[7], teams[6]);
            roundSecond = get8Round(this.edition, teams[9], teams[8], teams[11], teams[10], teams[13], teams[12], teams[15], teams[14]);
            round.games = round.games.concat(roundSecond.games);
            round.final = true;
            fix.push(round);
        }
        fix = this.cup8Round(fix, null, null, null, null, null, null, null, null);
        return fix;
    }

    /**
     * Crea el fixture con los datos seteados
     */
    this.getFixture = function() {
        if (this.type === PROPERTIES.EDITION.LEAGUE) {
            var lengthTour;
            if (this.teams.length == 4) {
                lengthTour = get4Fixture;
            }
            if (this.teams.length == 8) {
                lengthTour = get8Fixture;
            }
            var first = lengthTour(this.edition, this.teams);
            var second = [];
            if (this.double) {
                second = lengthTour(this.edition, changeTeamsPosition(this.teams));
            }
            return concatRounds(first, second);
        }
        if (this.type === PROPERTIES.EDITION.CUP) {
            if (this.teams.length == 4) {
                var fix = new Array();
                fix = this.cup4Round(fix, this.teams[0], this.teams[1], this.teams[2], this.teams[3]);
                return setNumber(fix);
            }
            if (this.teams.length == 8) {
                var fix = new Array();
                var teams = this.teams;
                fix = this.cup8Round(fix, teams[0], teams[1], teams[2], teams[3], teams[4], teams[5], teams[6], teams[7]);
                return setNumber(fix);
            }
            if (this.teams.length == 16) {
                var fix = new Array();
                var teams = this.teams;
                fix = this.cup16Round(fix, teams);
                return setNumber(fix);
            }
        }
    }

    /**
     * Devuelve un partido
     */
    function getMatch(home, away) {
        var game = {
            home: home,
            away: away
        };
        return game;
    }

    /**
     * Creacion de rondas de 2, 4 u 8 equipos
     */
    function get2Round(edition, t1, t2) {
        var round = {
            edition: edition
        };
        round.games = new Array();
        round.games.push(getMatch(t1, t2));
        return round;
    }

    function get4Round(edition, t1, t2, t3, t4) {
        var round = {
            edition: edition
        };
        round.games = new Array();
        round.games.push(getMatch(t1, t2));
        round.games.push(getMatch(t3, t4));
        return round;
    }

    function get8Round(edition, t1, t2, t3, t4, t5, t6, t7, t8) {
        var round = {
            edition: edition
        };
        round.games = new Array();
        round.games.push(getMatch(t1, t2));
        round.games.push(getMatch(t3, t4));
        round.games.push(getMatch(t5, t6));
        round.games.push(getMatch(t7, t8));
        return round;
    }

    /**
     * Fixtures para ligas
     */

    function get4Fixture(edition, teams) {
        var fix = new Array();
        fix.push(get4Round(edition, teams[0], teams[1], teams[2], teams[3]));
        fix.push(get4Round(edition, teams[0], teams[2], teams[3], teams[1]));
        fix.push(get4Round(edition, teams[3], teams[0], teams[1], teams[2]));
        return fix;
    }

    function get8Fixture(edition, teams) {
        var fix = new Array();
        fix.push(get8Round(edition, teams[3], teams[0], teams[1], teams[2], teams[7], teams[4], teams[5], teams[6]));
        fix.push(get8Round(edition, teams[7], teams[0], teams[1], teams[6], teams[3], teams[4], teams[5], teams[2]));
        fix.push(get8Round(edition, teams[0], teams[1], teams[2], teams[3], teams[4], teams[5], teams[6], teams[7]));
        fix.push(get8Round(edition, teams[5], teams[0], teams[1], teams[4], teams[2], teams[7], teams[6], teams[3]));
        fix.push(get8Round(edition, teams[0], teams[6], teams[7], teams[1], teams[4], teams[2], teams[3], teams[5]));
        fix.push(get8Round(edition, teams[0], teams[4], teams[5], teams[1], teams[6], teams[2], teams[3], teams[7]));
        fix.push(get8Round(edition, teams[2], teams[0], teams[1], teams[3], teams[4], teams[6], teams[7], teams[5]));
        return fix;
    }
}