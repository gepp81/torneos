module.exports = function Engine(game, teams) {
    
    this.game = game;
    this.teams = teams;
    
    console.log(teams.length);
    
    var getGoal = function(skills) {
        var skill = skills.split("'");
        return skill[Math.floor((Math.random() * 10) + 1)];
    }
    
    this.playGame = function() {
        if (this.game.home === this.teams[0].name) {
            this.game.homeGoals = getGoal(this.teams[0].skill);
            this.game.awayGoals = getGoal(this.teams[1].skill);
        } else {
            this.game.homeGoals = getGoal(this.teams[1].skill);
            this.game.awayGoals = getGoal(this.teams[0].skill);
            return this.game;
        }
    }
}