function ApplicationResource($resource) {
    return $resource("/application/:season", {}, {
        save: {
            method: 'POST',
            data: {
                season: "@season"
            }
        }
    });
};