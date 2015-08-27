function SeasonsResource($resource) {
    return $resource("/season/:page", {}, {
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

function SeasonResource($resource) {
    return $resource("/season/:tournaments", {}, {
        create: {
            method: 'POST',
            data: {
                tournaments: "@tournaments"
            }
        }
    });
};