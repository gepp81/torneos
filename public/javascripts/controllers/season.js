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

function SeasonPlayController($scope, $modal, $state, Season, Application) {

    var getSeason = function() {
        Application.get({},
            function(data) {
                $scope.season = data;
                Season.get({
                        id: data.season
                    },
                    function(data) {
                        $scope.season = data;
                    },
                    function(err) {

                    });
            },
            function(err) {

            });
    }

    getSeason();

}