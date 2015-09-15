function TeamController($scope, $modal, Teams) {
    
    var sizeByPage = 10;

    var getTeams = function(page) {
        Teams.getAll({
            page: page,
            size: 10
        }, function(data) {
            if (data.teams.length > 0) {
                $scope.teams = data.teams;
                $scope.totalItems = data.total;
            }
        }, function(error) {
            console.error("No recupero datos");
        });
    }

    $scope.pageChanged = function() {
        getTeams($scope.currentPage);
    }

    $scope.search = function() {
        $scope.currentPage = 1;
        getTeams($scope.currentPage);
    }
    
    getTeams(1);
    
 /** New and Edit **/

    $scope.open = function(size, item) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/team/form.html',
            controller: TeamSaveController,
            size: size,
            resolve: {
                team: function() {
                    return {
                        item: item
                    }
                }
            }
        });

        modalInstance.result.then(function(msg) {
            getTeams($scope.currentPage ? $scope.currentPage : 1);
        }, function() {

        });
    };    

};

function TeamSaveController($scope, $modalInstance, TeamSave, team) {
    $scope.team = team.item;

    $scope.ok = function() {
        if ($scope.team.id) {
            TeamSave.update({
                team: $scope.team
            }, function(data) {
                $modalInstance.close();
            }, function(error) {
            });
        } else {
            TeamSave.save({
                team: $scope.team
            }, function(data) {
                $modalInstance.close();
            }, function(error) {
            });
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

}