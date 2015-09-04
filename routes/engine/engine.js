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

    var getGoal = function(skills) {
        var skill = getSkill(skills);
        var number = Math.floor((Math.random() * 100)) + 1;
        var sum = 0;
        for (var key in percents[skill]) {
            sum = sum + percents[skill][key];
            if (number <= sum) {
                return key;
            }
        }
    }

    var getSkill = function(skills) {
        var skill = skills.split(",");
        return skill[Math.floor((Math.random() * 10))];
    }

    this.playGame = function() {
        var result = {};
        if (this.game.home === this.teams[0].name) {
            result.homeGoals = getGoal(this.teams[0].skill);
            result.awayGoals = getGoal(this.teams[1].skill);
        } else {
            result.homeGoals = getGoal(this.teams[1].skill);
            result.awayGoals = getGoal(this.teams[0].skill);
        }
        return result;
    }
}