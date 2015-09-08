function SeasonsResource($resource) {
    return $resource("/seasons/:page", {}, {
        getAll: {
            method: 'GET',
            isArray: 'true'
        },
        getPage: {
            method: 'GET',
            params: {
                page: "@page"
            }
        }
    });
};

function SeasonTournamentResource($resource) {
    return $resource("/season/:tournaments", {}, {
        create: {
            method: 'POST',
            data: {
                tournaments: "@tournaments"
            }
        }
    });
};

function SeasonResource($resource) {
    return $resource("/season/:id/:week", {}, {
        get: {
            method: 'get',
            params: {
                id: "@id"
            }
        },
        saveWeek: {
            method: 'put',
            data: {
                week: "@week",
                id: "@id"
            }
        }
    });
};

function GameResource($resource) {
    return $resource("/game/:id/:edition", {}, {
        play: {
            method: 'post',
            data: {
                id: "@id",
                edition: "@edition"
            }
        }
    });
};