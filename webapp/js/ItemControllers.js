var itemControllers = angular.module('itemControllers', []);

itemControllers.controller('itemDetailCtrl', ['$scope','$routeParams', '$http', '$log',
    function($scope, $routeParams, $http, $log) {
        var itemId = $routeParams.itemId;

        $http({
            url: SERVICE_HOST + "shareitem/" + itemId,
            method: "GET",
            params: {
                clientId: "e7568b2c-2c0f-480e-9e34-08f9a4b807dc"
            }
        }).success(function (response) {
                $scope.item = response.item;
                $log.info($scope.item);
        });
    }
]);

itemControllers.controller('itemListCtrl', ['$scope', '$http', '$log',
    function($scope, $http, $log) {
        $scope.items = [
        ];

        $scope.loadMore = function() {
            $http({
                url: SERVICE_HOST + "shareitem",
                method: "GET",
                params: {
                    clientId: "e7568b2c-2c0f-480e-9e34-08f9a4b807dc",
                    size: 3,
                    offset: $scope.items.length
                }
            })
                .success(function (response) {
                    $scope.items = $scope.items.concat(response.items);
                    $log.info($scope.items.length);
                });
        };
        $scope.loadMore();
    }
]);