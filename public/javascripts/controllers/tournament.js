function TournamentController($scope, $state, $modal, Tournament, Tournaments) {

    var getTournaments = function(page) {
        Tournaments.getAll({
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

function TournamentEditionController($scope, $state, $stateParams, Team, Edition) {
    $scope.item = $stateParams.item;
    $scope.selectedItems = [];

    $scope.addToList = function(item) {
        var index = $scope.selectedItems.indexOf(item);
        if (index == -1) {
            $scope.selectedItems.push(item);
            $scope.teamSelected = '';
        }
    }

    $scope.options = [{
        value: 4
    }, {
        value: 8
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

    $scope.ok = function() {
        Edition.save({
                tournament: $scope.item,
                edition: {
                    teams: $scope.selectedItems,
                    size: $scope.selectedOption

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
            if (data.size == (data.teams - 1) * 2) 
                $scope.double = true;
            $scope.selectedItems = data.teams;
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
            name: $scope.item.name
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

    getEditions();

};

function FixtureController($scope, $state, $stateParams, Fixture) {
    $scope.edition = $stateParams.item;
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

    getFixture();

};