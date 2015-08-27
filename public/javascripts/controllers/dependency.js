function DependencyController($scope, $timeout, $modal, Dependencies) {
    $scope.dependencies = [{
        name: "Acronym",
        alias: "Acrónimo"
    }, {
        name: "Conservation",
        alias: "Conservación"
    }, {
        name: "Dating",
        alias: "Datación"
    }, {
        name: "Age",
        alias: "Edad"
    }, {
        name: "Incoming",
        alias: "Ingreso"
    }, {
        name: "Integrity",
        alias: "Integridad"
    }, {
        name: "Location",
        alias: "Locación"
    }, {
        name: "OtherRest",
        alias: "Otros Restos"
    }, {
        name: "Preservation",
        alias: "Preservación"
    }, {
        name: "Accuracy",
        alias: "Precisión"
    }, {
        name: "State",
        alias: "Provincias"
    }, {
        name: "Sepulture",
        alias: "Sepultura"
    }, {
        name: "Sex",
        alias: "Sexo"
    }, {
        name: "Site",
        alias: "Sitio"
    }];

    var addAlert = function(msg, type) {
        if ($scope.selectedDependency) {
            msg = msg + ' ' + $scope.selectedDependency.alias + '.';
        }
        var alert = {
            type: type,
            msg: msg
        };
        $scope.alerts.push(alert);
        alert.close = function() {
            $scope.alerts.splice($scope.alerts.indexOf(this), 1);
        };

        $timeout(function() {
            $scope.alerts.splice($scope.alerts.indexOf(alert), 1);
        }, 3000);
    }

    var MSG_DANGER = 'danger';
    var MSG_INFO = 'info';
    var MSG_SUCCESS = 'success';
    var MSG_SELECT = 'Seleccione una dependencia.';
    var MSG_NOT_FOUND = "No se han encontrado valores para";
    var MSG_ERROR = "Error al buscar valores para";

    $scope.dependenciesList = false;
    $scope.cantSearch = true;
    $scope.alerts = [];
    addAlert(MSG_SELECT, MSG_INFO);

    var failGetDependencies = function(msg) {
        $scope.dependenciesList = false;
        $scope.currentPage = 1;
        addAlert(msg, MSG_DANGER);
    }

    var getDependencies = function(page) {
        $scope.cantSearch = true;
        if ($scope.selectedDependency === undefined) {
            addAlert(MSG_SELECT, MSG_INFO);
        } else {
            Dependencies.get({
                model: $scope.selectedDependency.name,
                page: page
            }, function(data) {
                if (data.dependencies.length == 0) {
                    failGetDependencies(MSG_NOT_FOUND);
                } else {
                    $scope.dependenciesList = data.dependencies;
                    $scope.totalItems = data.total;
                }
            }, function(error) {
                failGetDependencies(MSG_ERROR);
            });
        }
    };

    $scope.getPaginationInfo = function() {
        var page = $scope.currentPage ? $scope.currentPage : 1;
        var min = (page - 1) * 10 + 1;
        var max = (min + 9) < $scope.totalItems ? (min + 9) : $scope.totalItems;
        return "Items " + min.toString() + " al " + max + " . Total de items " + $scope.totalItems + ".";
    }

    $scope.searchDependency = function() {
        $scope.currentPage = 1;
        getDependencies($scope.currentPage);
    }

    $scope.pageChanged = function() {
        getDependencies($scope.currentPage);
    }

    $scope.searchTypeChanged = function() {
        $scope.cantSearch = false;
    }

    /** New and Edit **/

    $scope.open = function(size, item, selectedDependency) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/dependencies/form.html',
            controller: ModalSaveController,
            size: size,
            resolve: {
                dependency: function() {
                    return {
                        item: item,
                        model: selectedDependency
                    }
                }
            }
        });

        modalInstance.result.then(function(msg) {
            getDependencies($scope.currentPage ? $scope.currentPage : 1);
            addAlert(msg.text, MSG_SUCCESS);  
        }, function() {

        });
    };

    /**   $scope.$on("$destroy", function(){
          console.log("");
       });**/
}

function ModalSaveController($scope, $modalInstance, Dependency, dependency) {
    $scope.dependency = dependency.item;
    $scope.model = dependency.model.name;
    $scope.modelAlias = dependency.model.alias;
    $scope.originalName = dependency.item ? dependency.item.name : '';

    $scope.ok = function() {
        if ($scope.dependency.id) {
            Dependency.put({
                model: $scope.model,
                name: $scope.dependency.name,
                id: $scope.dependency.id
            }, function(data) {
                var msg = {
                    type: "SUCCESS",
                    text: "Se ha actualizado con éxito un/una "
                };
                $modalInstance.close(msg);
            }, function(error) {
                var msg = {
                    type: "ERROR",
                    text: "Se ha producido un error al actualizar."
                };
            });
        } else {
            Dependency.post({
                model: $scope.model,
                name: $scope.dependency.name,
            }, function(data) {
                var msg = {
                    type: "SUCCESS",
                    text: "Se ha creado con éxito un/una "
                };
                $modalInstance.close(msg);
            }, function(error) {
                var msg = {
                    type: "ERROR",
                    text: "Se ha producido un error al crear un item."
                };
            });
        }
    };

    $scope.cancel = function() {
        if ($scope.originalName) {
            $scope.dependency.name = $scope.originalName;
        }
        $modalInstance.dismiss();
    };

    $scope.equalsToOrigin = function(name) {
        if (name === $scope.originalName) {
            return true;
        }
        return false;
    }
}