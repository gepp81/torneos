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
        $scope.tournamentSelected = '';
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

function SeasonPlayController($scope, $modal, $state, $q, Season, Application, Round, Game, Position) {

    var hasTies = function(positions) {
        for (var i = 0; i < positions.length; i++) {
            for (var j = 0; j < positions.length; j++) {
                if (i !== j) {
                    if (positions[i].points === positions[j].points) {
                        if (positions[i].dg === positions[j].dg) {
                            if (positions[i].goals === positions[j].goals) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    var getPositions = function(editions) {
        Position.getPosition({
            editions: editions
        }, function(data) {
            $scope.ties = {};
            angular.forEach(data, function(value, key) {
                angular.forEach(value.positions, function(pos, poskey) {
                    pos.points = $scope.getPoints(pos);
                    pos.dg = pos.goals - pos.received;
                });
                $scope.ties[key] = hasTies(value.positions);
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
                        $scope.playedWeek = data.week;
                        //getRound(data.editions, data.week);
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
                Game.playGames({
                    edition: round[eKey].rounds.edition,
                    final: round[eKey].rounds.final,
                    double: round[eKey].double,
                    number: round[eKey].rounds.number,
                }, function(data) {
                    getRound($scope.editions, $scope.weekPagination);
                }, function(err) {});
            }
        });
    };

    $scope.defineLeague = function(positions, edition) {
        Position.define({
            edition: edition
        }, function(data) {
            angular.forEach(data, function(value, key) {
                value.points = $scope.getPoints(value);
                value.dg = value.goals - value.received;
            });
            $scope.positions[edition].positions = data;
            $scope.ties[edition] = false;
        }, function(err) {

        });
    }

    $scope.getColorPosition = function(pos) {
        var classLabel = 'label label-';
        if (pos == 1) {
            return classLabel + 'primary';
        }
        if (pos == 2) {
            return classLabel + 'info';
        }
        if (pos == 3) {
            return classLabel + 'success';
        }
        return '';
    }

    $scope.getPoints = function(position) {
        return position.win * 3 + position.tie;
    }

    $scope.classLastPage = function() {
        if ($scope.weekPagination == $scope.size) {
            return 'leftMargin25';
        }
        return '';
    }

    $scope.canCreateRound = function() {
        return $scope.winners;
    }

    getSeason();

    $scope.canPlay = function() {
        if ($scope.weekPagination) {
            return $scope.weekPagination >= $scope.playedWeek ? true : false;
        }
        return false;
    }

}