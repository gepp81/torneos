function TournamentResource($resource) {
    return $resource("/tournaments/getAll/:page/:id", {}, {
        getAllPage: {
            method: 'GET',
            params: {
                page: "@page"
            }
        },
        getAll: {
            method: 'GET',
            isArray: 'true'
        },
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
    return $resource("/edition/:tournament/:edition/:double/:lastEdition", {}, {
        save: {
            method: 'POST',
            data: {
                tournament: "@tournament",
                edition: "@edition",
                double: "@double"
            }
        },
        remove: {
            method: 'DELETE',
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
        },
        getLastEdition: {
            method: 'GET',
            params: {
                tournament: "@tournament",
                lastEdition: "@lastEdition"
            }
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

function RoundResource($resource) {
    return $resource("/round/:editions/:week", {}, {
        getRound: {
            method: 'POST',
            data: {
                edition: "@edition",
                week: "@week"
            },
            interceptor: {
                response: function(response) {
                    return response.data;
                }
            }
        }
    });
};

function PositionResource($resource) {
    return $resource("/position/:editions/:number/:tournament", {}, {
        getPosition: {
            method: 'POST',
            data: {
                edition: "@edition"
            },
            interceptor: {
                response: function(response) {
                    return response.data;
                }
            }
        },
        getByTournament: {
            method: 'GET',
            params: {
                tournament: "@tournament",
                number: "@number"
            },
            isArray: 'true',
            interceptor: {
                response: function(response) {
                    return response.data;
                }
            }
        },
        define: {
            method: 'PUT',
            data: {
                edition: "@edition"
            },
            isArray: 'true',
            interceptor: {
                response: function(response) {
                    return response.data;
                }
            }
        }
    });
};