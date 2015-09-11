module.exports = function Engine(game, teams) {

    var percents = {
        1: [100],
        2: [
            90, 10
        ],
        3: [
            80, 15, 5
        ],
        4: [
            70, 18, 12
        ],
        5: [
            60, 20, 15, 5
        ],
        6: [
            50, 23, 18, 9
        ],
        7: [
            39, 26, 20, 10, 5
        ],
        8: [
            28, 28, 22, 12, 6, 4
        ],
        9: [
            16, 29, 23, 13, 9, 7, 3
        ],
        10: [
            5, 31, 25, 15, 11, 9, 4
        ]
    }

    this.game = game;
    this.teams = teams;
    this.dobule = false;
    this.final = false;
    this.lastGame = undefined;

    this.setFinal = function(final) {
        this.final = final;
    }

    this.setDouble = function(double) {
        this.double = double;
    }

    this.setLastGame = function(lastGame) {
        this.lastGame = lastGame;
    }

    this.getGoal = function(skills) {
        var skill = this.getSkill(skills);
        var number = Math.floor((Math.random() * 100)) + 1;
        var sum = 0;
        for (var key in percents[skill]) {
            sum = sum + percents[skill][key];
            if (number <= sum) {
                return key;
            }
        }
    }

    this.getSkill = function(skills) {
        var skill = skills.split(",");
        return skill[Math.floor((Math.random() * 10))];
    }

    this.playSimpleGame = function() {
        var result = {};
        if (this.game.home === this.teams[0].name) {
            result.homeGoals = this.getGoal(this.teams[0].skill);
            result.awayGoals = this.getGoal(this.teams[1].skill);
        } else {
            result.homeGoals = this.getGoal(this.teams[1].skill);
            result.awayGoals = this.getGoal(this.teams[0].skill);
        }
        return result;
    }

    this.playSimpleFinalGame = function() {
        var wrongResult = true;
        while (wrongResult) {
            var result = this.playSimpleGame();
            if (result.homeGoals != result.awayGoals) {
                result.winner = result.homeGoals > result.awayGoals ? this.game.home : this.game.away;
                return result;
            }
        }
    }

    this.getPoints = function(first, second) {
        if (first > second) {
            return 3;
        } else if (second == first) {
            return 1;
        } else {
            return 0;
        }
    }

    this.getTeamDoubleResults = function(result, lastGame) {
        var resultState = {};
        resultState.status = true;
        var homePoints = 0 + this.getPoints(lastGame.homeGoals, lastGame.awayGoals);
        var awayPoints = 0 + this.getPoints(lastGame.awayGoals, lastGame.homeGoals);

        homePoints = homePoints + this.getPoints(result.awayGoals, result.homeGoals);
        awayPoints = awayPoints + this.getPoints(result.homeGoals, result.awayGoals);

        if (homePoints == awayPoints) {
            return resultState;
        } else {
            resultState.status = false;
            resultState.winner = homePoints > awayPoints ? lastGame.home : lastGame.away;
            return resultState;
        }
    }

    this.playDoubleFinalGame = function() {
        var wrongResult = true;
        while (wrongResult) {
            var result = this.playSimpleGame();
            var roundResults = this.getTeamDoubleResults(result, this.lastGame, this.game);
            wrongResult = roundResults.status;
            console.log(roundResults.winner);
            if (roundResults.winner)
                result.winner = roundResults.winner;
        }

        return result;
    }

    this.playGame = function() {
        if (this.final) {
            if (this.double) {
                return this.playDoubleFinalGame();
            } else {
                return this.playSimpleFinalGame();
            }
        } else {
            return this.playSimpleGame();
        }

    }
}