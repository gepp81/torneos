function TeamsResource($resource) {
    return $resource("/team/getAll/:page/:size", {}, {
        getAll: {
            method: 'GET',
            params: {
                page: "@page",
                size: "@size"
            }
        }
    });
};

function TeamResource($resource) {
    return $resource("/team/:id", {}, {
        get: {
            method: 'GET',
            params: {
                id: "@id"
            }
        },
        getAll: {
            method: 'GET',
            isArray: 'true'
        }
    });
};

function TeamSaveResource($resource) {
    return $resource("/team/:team", {}, {
        save: {
            method: 'POST',
            /*  headers: {
                  'Content-Type': 'application/json'
              },*/
            data: {
                team: "@team"
            }
        },
        update: {
            method: 'PUT',
            data: {
                team: "@team"
            }
        }
    });
};