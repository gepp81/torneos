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
    return $resource("/season/:id", {}, {
        get: {
            method: 'get',
            params: {
                id: "@id"
            }
        }
    });
};

function GameResource($resource) {
    return $resource("/game/:id", {}, {
        play: {
            method: 'post',
            data: {
                id: "@id"
            }
        }
    });
};