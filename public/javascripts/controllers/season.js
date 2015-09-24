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
        }, function(data) {}, function(error) {});
    }

    $scope.getTournaments = function(editions) {
        var tours = new Array();
        for (var i in editions) {
            tours.push(i);
        }
        return tours;
    }
}

function SeasonNewController($scope, $modal, $state, $stateParams, SeasonTournament, Tournament) {

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
            function(err) {});
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

    Tournament.getAll({}, function(data) {
        if (data.length > 0) {
            $scope.tournaments = data;
        }
    }, function(error) {
        console.error("No recupero datos");
    });

}

function SeasonPlayController($scope, $modal, $state, $localStorage, $timeout, Season, Application, Round, Game, Position) {

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
        }, function(err) {});
    }

    var getRound = function(editions, week) {
        Round.getRound({
            editions: editions,
            week: week
        }, function(data) {
            $scope.rounds = data;
        }, function(err) {});
    }

    $scope.weekChanged = function() {
        $localStorage.week = $scope.weekPagination;
        if ($scope.weekPagination != $scope.size) {
            getRound($scope.editions, $scope.weekPagination);
        } else {
            angular.forEach($scope.editions, function(value, key) {
                Position.define({
                    edition: value.id
                }, function(data) {}, function(err) {});
            });

        }
        getPositions($scope.editions);
    }

    var getSeason = function() {
        Application.get({},
            function(data) {
                if (data) {
                    $scope.season = data;
                    Season.get({
                            id: data.season
                        },
                        function(data) {
                            $scope.editions = data.editions;
                            $scope.size = data.size + 1;
                            if ($localStorage.week) {
                                $scope.weekPagination = $localStorage.week;
                            } else {
                                $scope.weekPagination = data.week;
                            }
                            $scope.playedWeek = data.week;
                            $scope.weekChanged();
                        },
                        function(err) {});
                } else {
                    $scope.season = undefined;
                }
            },
            function(err) {});
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
                    $timeout(Position.define({
                        edition: round[eKey].rounds.edition
                    }, function(data) {}, function(err) {}), 10000);

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
        }, function(err) {});
    }

    $scope.getPoints = function(position) {
        return position.win * 3 + position.tie;
    }

    $scope.canCreateRound = function() {
        return $scope.winners;
    }

    $scope.classLastPage = function() {
        if ($scope.weekPagination == $scope.size) {
            return 'leftMargin25';
        }
        return '';
    }

    $scope.getTextPosition = function(position) {
        if ($scope.weekPagination != $scope.size) {
            return position;
        }
        if (position > 0 && position < 4) {
            var start = {};
            start.start = true;
            return start;
        }
        return position;
    }

    $scope.getColorPosition = function(pos) {
        if ($scope.weekPagination != $scope.size) {
            return '';
        } else {
            var classLabel = 'label label-position label-position-';
            if (pos == 1) {
                return classLabel + 'gold';
            }
            if (pos == 2) {
                return classLabel + 'silver';
            }
            if (pos == 3) {
                return classLabel + 'brown';
            }
        }
        return '';
    }

    getSeason();

    $scope.$on("$destroy", function() {
        $localStorage.week = $scope.weekPagination;
    });

    $scope.finalizeSeason = function(editions) {
        Application.finalize({
            season: $scope.season.season
        }, function(data) {

        }, function(err) {

        });
    }

}