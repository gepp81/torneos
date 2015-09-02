module.exports = function Engine(game, teams) {
    
    this.game = game;
    this.teams = teams;
    
    var getGoal = function(skills) {
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