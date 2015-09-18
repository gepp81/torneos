function ChampionTourResource($resource) {
    return $resource("/champions/:tournament/:lastEdition", {}, {
        getChampions: {
            method: 'GET',
            params: {
                tournament: "@tournamen",
                lastEdition: "@lastEdition"
            },
            isArray: 'true'
        },
        interceptor: {
            response: function(response) {
                return response.data;
            }
        },
        getAllChampions: {
            method: 'post',
            data: {
                lastEdition: "@lastEdition"
            },
            isArray: 'true'
        },
        interceptor: {
            response: function(response) {
                return response.data;
            }
        }
    });
};