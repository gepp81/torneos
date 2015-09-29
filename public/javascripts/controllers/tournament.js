function TournamentController($scope, $state, $modal, Tournament) {

    var getTournaments = function(page) {
        Tournament.getAllPage({
            page: page
        }, function(data) {
            if (data.tournaments.length > 0) {
                $scope.tournaments = data.tournaments;
                $scope.totalItems = data.total;
            }
        }, function(error) {
            console.error("No recupero datos");
        });
    }

    $scope.pageChanged = function() {
        getTournaments($scope.currentPage);
    }

    $scope.search = function() {
        $scope.currentPage = 1;
        getTournaments($scope.currentPage);
    }

    getTournaments(1);

    /** New and Edit **/

    $scope.listEditions = function(item) {
        $state.go('edition', {
            item: item
        });
    }

    $scope.getChampions = function(item) {
        $state.go('championByTour', {
            item: item
        });
    }

    $scope.open = function(size, item) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/tournament/form.html',
            controller: TournamentSaveController,
            size: size,
            resolve: {
                tournament: function() {
                    return {
                        item: item
                    }
                }
            }
        });

        modalInstance.result.then(function(msg) {
            getTournaments($scope.currentPage ? $scope.currentPage : 1);
        }, function() {

        });
    };

};

function TournamentSaveController($scope, $modalInstance, TournamentSave, tournament) {
    $scope.tournament = tournament.item;

    $scope.options = [{
        value: 'a'
    }, {
        value: 'b'
    }, {
        value: 'c'
    }, {
        value: 'i'
    }];
    
    $scope.selectedOption = { value: $scope.tournament.type };

    $scope.ok = function() {
        if ($scope.tournament.id) {
            TournamentSave.update({
                tournament: $scope.tournament
            }, function(data) {
                $modalInstance.close();
            }, function(error) {});
        } else {
            TournamentSave.save({
                tournament: $scope.tournament
            }, function(data) {
                $modalInstance.close();
            }, function(error) {});
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

};

function TournamentEditionController($scope, $state, $stateParams, Tournament, Team, Edition, Position) {
    $scope.item = $stateParams.item;
    $scope.selectedItems = new Array();

    $scope.startWeek = 1;

    $scope.addToList = function(item) {
        var index = $scope.selectedItems.indexOf(item);
        if (index == -1) {
            $scope.selectedItems.push(item);
            $scope.teamSelected = '';
        }
    }

    $scope.selectTournament = function(tournament) {
        if (!$scope.tournamentTeamsTotal)
            $scope.tournamentTeamsTotal = 1;
        Position.getByTournament({
            tournament: tournament,
            number: $scope.tournamentTeamsTotal
        }, function(data) {
            for (var i in data) {
                $scope.addToList(data[i]);
            }
            $scope.tournamentSelected = '';
        }, function(err) {

        })
    }

    $scope.options = [{
        value: 4
    }, {
        value: 8
    }, {
        value: 16
    }];

    $scope.cancel = function() {
        $state.go('edition', {
            item: $scope.item
        });
    }

    $scope.remover = function(item) {
        var index = $scope.selectedItems.indexOf(item);
        if (index > -1) {
            $scope.selectedItems.splice(index, 1);
        }
    }

    Team.getAll({}, function(data) {
        if (data.length > 0) {
            $scope.teams = data;
        }
    }, function(error) {
        console.error("No recupero datos");
    });

    Tournament.getAll({},
        function(data) {
            if (data.length > 0)
                $scope.tournaments = data;
        },
        function(err) {}
    );

    $scope.ok = function() {
        Edition.save({
                tournament: $scope.item,
                edition: {
                    teams: $scope.selectedItems,
                    size: $scope.selectedOption,
                    type: $scope.type,
                    startWeek: $scope.startWeek
                },
                double: $scope.double
            },
            function(data) {
                $state.go('edition', {
                    item: $scope.item
                });
            },
            function(error) {});
    }

    $scope.changeState = function() {
        Edition.getLastEdition({
            tournament: $scope.item.id,
            lastEdition: $scope.item.editionPlayed
        }, function(data) {
            $scope.double = data.double;
            $scope.startWeek = data.startWeek;
            $scope.selectedItems = data.teams;
            $scope.type = data.type;
            $scope.selectedOption = {
                value: data.teams.length
            };
        }, function(err) {

        })
    }

};

function EditionController($scope, $state, $stateParams, Edition) {
    $scope.item = $stateParams.item;

    $scope.addEdition = function(item) {
        //'tournamentEdition'
        $state.go('addEdition', {
            item: item
        });
    }

    $scope.getFixture = function(item) {
        $state.go('getFixture', {
            item: item,
            name: $scope.item.name,
            season: $scope.item
        });
    }

    $scope.cancel = function(item) {
        $state.go('tournament', {
            item: item
        });
    }

    var getEditions = function() {
        Edition.getAll({
            tournament: $scope.item.id
        }, function(data) {
            if (data.length > 0) {
                $scope.editions = data;
            }
        }, function(error) {
            console.error("No recupero datos");
        });
    }

    $scope.remove = function(item) {
        Edition.remove({
            tournament: item.league,
            edition: item.id
        }, function(data) {}, function(err) {})
    }

    getEditions();

};

function FixtureController($scope, $state, $stateParams, Fixture) {
    $scope.edition = $stateParams.item;
    $scope.season = $stateParams.season;
    $scope.league = $stateParams.name;

    var getFixture = function() {
        Fixture.getAll({
            edition: $scope.edition.id
        }, function(data) {
            $scope.fixture = data;
        }, function(err) {
            console.error("No recupero datos");
        });
    }

    $scope.cancel = function(item) {
        $state.go('edition', {
            item: $scope.season
        });
    }

    getFixture();

};

function ChampionTourController($scope, $stateParams, ChampionTour, PointsTour) {

    $scope.tournament = $stateParams.item;

    var query = ChampionTour.getChampions({
        tournament: $scope.tournament.id,
        lastEdition: $scope.tournament.editionPlayed
    });

    query.$promise.then(function(data) {
        $scope.champions = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            $scope.champions.push(item);
        }
    });

    query = PointsTour.getPoints({
        tournament: $scope.tournament.id
    });

    query.$promise.then(function(data) {
        $scope.points = [];
        var item
        for (var i = 0; i < data.length; i++) {
            item = data[i];
            item.total = parseInt(item.wins) * 3 + parseInt(item.ties);
            $scope.points.push(item);
        }
    });

}