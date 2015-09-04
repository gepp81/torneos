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

function SeasonPlayController($scope, $modal, $state, Season, Application, Round, Game, Position) {

    var getPositions = function(editions) {
        Position.getPosition({
            editions: editions
        }, function(data) {
            angular.forEach(data, function(value, key) {
                angular.forEach(value.positions, function(pos, poskey) {
                    pos.points = $scope.getPoints(pos);
                    pos.dg = pos.goals - pos.received;
                });
            });
            $scope.positions = data;            
        }, function(err) {

        });
    }

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
        if ($scope.weekPagination != $scope.size)
            getRound($scope.editions, $scope.weekPagination);
        getPositions($scope.editions);
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
                        $scope.size = data.size + 1;
                        $scope.weekPagination = data.week;
                        getRound(data.editions, data.week);
                        $scope.weekChanged();
                    },
                    function(err) {

                    });
            },
            function(err) {

            });
    }

    $scope.playGames = function(games) {
        angular.forEach(games, function(value, key) {
            Game.play({
                id: games[key].id
            }, function(data) {
                games[key] = data
            }, function(err) {});
        });

    }

    $scope.playWeek = function(round) {
        angular.forEach(round, function(eValue, eKey) {
            if (round[eKey].rounds) {
                angular.forEach(round[eKey].rounds.games, function(value, key) {
                    if (round[eKey].rounds.games[key].homeGoals === null && round[eKey].rounds.games[key].awayGoals === null) {
                        Game.play({
                            id: round[eKey].rounds.games[key].id,
                            edition: round[eKey].rounds.edition
                        }, function(data) {
                            round[eKey].rounds.games[key] = data;
                        }, function(err) {

                        });
                    }
                });
            }
        });
    }
    
    $scope.getPoints = function (position) {
        return  position.win * 3 + position.tie;
    }

    getSeason();

}