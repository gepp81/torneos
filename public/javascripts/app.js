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
            .state("play", {
                url: "/play",
                templateUrl: "views/season/play.html"
            })        
            .state("error", {
                url: "/error",
                templateUrl: "views/error.html"
            })
            .state("season", {
                url: "/seasons",
                templateUrl: "views/season/list.html"
            })
            .state("newSeason", {
                url: "/newSeason",
                templateUrl: "views/season/form.html"
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
    .factory("Seasons", SeasonsResource)
    .factory("Season", SeasonResource)
    .factory("SeasonTournament", SeasonTournamentResource)
    .factory("Edition", EditionResource)
    .factory("Fixture", FixtureResource)
    .factory("Application", ApplicationResource)
    .factory("Round", RoundResource)
    .factory("Game", GameResource)
    .factory("Position", PositionResource)
    .factory("TournamentSave", TournamentSaveResource);

app
    .controller("TeamController", TeamController)
    .controller("TournamentController", TournamentController)
    .controller("EditionController", EditionController)
    .controller("TournamentEditionController", TournamentEditionController)
    .controller("FixtureController", FixtureController)
    .controller("SeasonController", SeasonController)
    .controller("SeasonNewController", SeasonNewController)
    .controller("SeasonPlayController", SeasonPlayController)
    .controller("TeamSaveController", TeamSaveController);