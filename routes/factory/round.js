module.exports = function RoundFactory(edition, double) {

    this.teams = edition.teams;
    this.double = double;
    this.edition = edition.id;

    function changeTeamsPosition(teams) {
        for (var i = 0; i < teams.length; i = i + 2) {
            var temp = teams[i];
            teams[i] = teams[i + 1];
            teams[i + 1] = temp;
        }
        return teams;
    }

    this.getFixture = function() {
        if (this.teams.length == 4) {
            var first = get4Fixture(this.edition, this.teams);
            var second = [];
            if (this.double) {
                second = get4Fixture(this.edition, changeTeamsPosition(this.teams));
            }
            var finalFix = first.concat(second);
            for (var i = 0; i < finalFix.length; i++) {
                var elem = finalFix[i];
                elem.number = i + 1;
            }
            return finalFix;
        }
    }

    function getMatch(home, away) {
        var game = {
            home: home,
            away: away
        };
        return game;
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

    function get4Fixture(edition, teams) {
        var fix = new Array();
        fix.push(get4Round(edition, teams[0], teams[1], teams[2], teams[3]));
        fix.push(get4Round(edition, teams[0], teams[2], teams[3], teams[1]));
        fix.push(get4Round(edition, teams[3], teams[0], teams[1], teams[2]));
        return fix;
    }
}