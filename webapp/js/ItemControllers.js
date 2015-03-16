var itemControllers = angular.module('itemControllers', []);

itemControllers.controller('ItemDetailCtrl', ['$scope','$routeParams', '$http', '$log',
    function($scope, $routeParams, $http, $log) {
        var itemId = $routeParams.itemId;

        $http({
            url: SERVICE_HOST_API_URL + "shareitem/" + itemId,
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

itemControllers.controller('ItemListCtrl', ['$scope', '$http', '$log', '$route', '$window',
    function($scope, $http, $log, $route, $window) {
        var userId;
        if($route.current.filter && $route.current.filter.userSpecific) {
            var userJson = $window.sessionStorage.getItem('currentUser');
            userId = angular.fromJson(userJson).id;
        }

        $scope.serviceHostApiUrl = SERVICE_HOST_API_URL;
        $scope.items = [];
        $scope.loadMoreText = '';
        $scope.loadBusy = false;

        $scope.loadMore = function() {
            $scope.loadBusy = true;

            $http({
                url: SERVICE_HOST_API_URL + "shareitem",
                method: "GET",
                params: {
                    clientId: "e7568b2c-2c0f-480e-9e34-08f9a4b807dc",
                    size: 3,
                    offset: $scope.items.length,
                    userId: userId
                }
            })
            .success(function (response) {
                if(response.items.length == 0) {
                    $scope.loadMoreText = "no more items";
                } else {
                    $scope.loadMoreText = "";
                }
                $scope.loadBusy = false;
                $scope.items = $scope.items.concat(response.items);
                $log.info($scope.items.length);
            });
        };
    }
]);