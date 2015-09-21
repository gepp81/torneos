function ApplicationResource($resource) {
    return $resource("/application/:season", {}, {
        save: {
            method: 'POST',
            data: {
                season: "@season"
            }
        },
        finalize: {
            method: 'PUT',
            data: {
                season: "@season"
            }
        },
        get: {
            method: 'GET'
        }
    });
};