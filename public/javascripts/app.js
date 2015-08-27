var app = angular.module('Torneos', ['ngResource', 'ui.router', 'ui.bootstrap'])
    .config(function($urlRouterProvider, $stateProvider) {
        // Parametros de configuración
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state("home", {
                url: "/home"
            })
            .state("team", {
                url: "/teams",
                templateUrl: "views/team/list.html"
            })
            .state("error", {
                url: "/error",
                templateUrl: "views/error.html"
            })
            .state("tournament", {
                url: "/tournaments",
                templateUrl: "views/tournament/list.html"
            })
            .state("edition", {
                url: "/edition",
                params: {
                    item: null
                },
                templateUrl: "views/edition/list.html"
            })
            .state("addEdition", {
                url: "/addEdition",
                params: {
                    item: null
                },
                templateUrl: "views/edition/form.html"
            })
            .state("getFixture", {
                url: "/getFixture",
                params: {
                    item: null,
                    name: null
                },
                templateUrl: "views/edition/fixture.html"
            });
    });

app
    .factory("Teams", TeamsResource)
    .factory("Team", TeamResource)
    .factory("TeamSave", TeamSaveResource)
    .factory("Tournaments", TournamentsResource)
    .factory("Tournament", TournamentResource)
    .factory("Edition", EditionResource)
    .factory("Fixture", FixtureResource)
    .factory("TournamentSave", TournamentSaveResource);

app
    .controller("TeamController", TeamController)
    .controller("TournamentController", TournamentController)
    .controller("EditionController", EditionController)
    .controller("TournamentEditionController", TournamentEditionController)
    .controller("FixtureController", FixtureController)
    .controller("TeamSaveController", TeamSaveController);