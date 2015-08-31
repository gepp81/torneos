function SeasonController($scope, $modal, $state, Seasons, Application) {

    var getSeasonsPage = function(page) {
        Seasons.getPage({
            page: page
        }, function(data) {
            if (data.seasons.length > 0) {
                $scope.seasons = data.seasons;
                $scope.totalItems = data.total;
            }
        }, function(error) {
            console.error("No recupero datos");
        });
    }

    $scope.pageChanged = function() {
        getSeasonsPage($scope.currentPage);
    }

    getSeasonsPage(1);

    // add season
    $scope.newSeason = function() {
        $state.go('newSeason');
    }

    $scope.setDefault = function(item) {
        Application.save({
            season: item
        }, function(data) {

        }, function(error) {

        });
    }
}

function SeasonNewController($scope, $modal, $state, $stateParams, SeasonTournament, Tournaments) {

    $scope.selectedItems = [];

    $scope.cancel = function() {
        $state.go('season');
    }

    $scope.save = function() {
        SeasonTournament.create({
                tournaments: $scope.selectedItems
            },
            function(data) {
                $state.go('season');
            },
            function(err) {

            });
    }

    $scope.addToList = function(item) {
        var index = $scope.selectedItems.indexOf(item);
        if (index == -1) {
            $scope.selectedItems.push(item);
        }
    }

    $scope.remover = function(item) {
        var index = $scope.selectedItems.indexOf(item);
        if (index > -1) {
            $scope.selectedItems.splice(index, 1);
        }
    }

    Tournaments.get({}, function(data) {
        if (data.length > 0) {
            $scope.tournaments = data;
        }
    }, function(error) {
        console.error("No recupero datos");
    });

}

function SeasonPlayController($scope, $modal, $state, Season, Application, Round, Game) {

    var getRound = function(editions, week) {
        Round.getRound({
            editions: editions,
            week: week
        }, function(data) {
            $scope.rounds = data;
        }, function(err) {

        });
    }

    $scope.weekChanged = function() {
        getRound($scope.editions, $scope.weekPagination);
    }

    var getSeason = function() {
        Application.get({},
            function(data) {
                $scope.season = data;
                Season.get({
                        id: data.season
                    },
                    function(data) {
                        $scope.editions = data.editions;
                        $scope.size = data.size;
                        $scope.weekPagination = data.week;
                        getRound(data.editions, data.week);
                    },
                    function(err) {

                    });
            },
            function(err) {

            });
    }

    $scope.playGames = function(games) {
        for (var game in games) {
            Game.play({
                id: games[game].id
            }, function(data) {
                game.homeGoals = data.homeGoals;
                game.awayGoals = data.awayGoals;
            }, function(err) {

            });
        }
    }

    getSeason();

}