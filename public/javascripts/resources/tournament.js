function TournamentsResource($resource) {
    return $resource("/tournament/getAll/:page", {}, {
        getAll: {
            method: 'GET',
            params: {
                page: "@page"
            }
        }
    });
};

function TournamentResource($resource) {
    return $resource("/tournament/:id", {}, {
        get: {
            method: 'GET',
            params: {
                id: "@id"
            }
        }
    });
};

function TournamentSaveResource($resource) {
    return $resource("/tournament/:tournament", {}, {
        save: {
            method: 'POST',
            data: {
                tournament: "@tournament"
            }
        },
        update: {
            method: 'PUT',
            data: {
                tournament: "@tournament"
            }
        }
    });
};

function EditionResource($resource) {
    return $resource("/edition/:tournament/:edition", {}, {
        save: {
            method: 'POST',
            data: {
                tournament: "@tournament",
                edition: "@edition"
            }
        },
        getAll: {
            method: 'GET',
            params: {
                tournament: "@tournament"
            },
            isArray: 'true'
        }
    });
};

function FixtureResource($resource) {
    return $resource("/fixture/:edition", {}, {
        getAll: {
            method: 'GET',
            params: {
                edition: "@edition"
            },
            isArray: 'true'
        }
    });
};