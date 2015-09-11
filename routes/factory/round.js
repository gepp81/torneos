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

    this.getFixture = function() {
        if (this.type === "LEAGUE") {
            var lenghTour;
            if (this.teams.length == 4) {
                lenghTour = get4Fixture;
            }
            if (this.teams.length == 8) {
                lenghTour = get8Fixture;
            }
            var first = lenghTour(this.edition, this.teams);
            var second = [];
            if (this.double) {
                second = lenghTour(this.edition, changeTeamsPosition(this.teams));
            }
            return concatRounds(first, second);
        }
        if (this.type === "CUP") {
            if (this.teams.length == 4) {
                var fix = new Array();
                var round = get4Round(this.edition, this.teams[0], this.teams[1], this.teams[2], this.teams[3]);
                fix.push(round);
                round.final = !this.double;
                if (this.double) {
                    round = get4Round(this.edition, this.teams[1], this.teams[0], this.teams[3], this.teams[2]);
                    round.final = true;
                    fix.push(round);
                }
                round = get2Round(this.edition, null, null);
                round.final = !this.double;
                fix.push(round);
                if (this.double) {
                    round = get2Round(this.edition, null, null);
                    round.final = true;
                    fix.push(round);
                }
                return setNumber(fix);
            }
            if (this.teams.length == 8) {
                var fix = new Array();
                var teams = this.teams;
                var round = get8Round(this.edition, teams[0], teams[1], teams[2], teams[3], teams[4], teams[5], teams[6], teams[7]);
                round.final = !this.double;
                fix.push(round);
                if (this.double) {
                    round(get8Round(this.edition, teams[1], teams[0], teams[3], teams[2], teams[4], teams[5], teams[7], teams[6]));
                    round.final = true;
                    fix.push(round);
                }
                round = get4Round(this.edition, null, null, null, null);
                round.final = !this.double;
                fix.push(round);
                if (this.double) {
                    round = get4Round(this.edition, null, null, null, null);
                    round.final = true;
                    fix.push(round);
                }
                round = get2Round(this.edition, null, null);
                round.final = !this.double;
                fix.push(round);
                if (this.double) {
                    round = get2Round(this.edition, null, null);
                    round.final = true;
                    fix.push(round);
                }
                return setNumber(fix);
            }
        }
    }

    function getMatch(home, away) {
        var game = {
            home: home,
            away: away
        };
        return game;
    }

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