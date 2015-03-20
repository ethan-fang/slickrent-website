var itemControllers = angular.module('itemControllers', ['xeditable', 'ui.bootstrap.datetimepicker']);

itemControllers.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});


itemControllers.controller('ItemDetailCtrl', ['$scope','$routeParams', '$http', '$log', '$window',
    function($scope, $routeParams, $http, $log, $window) {
        var userId;
        var userJson = $window.sessionStorage.getItem('currentUser');

        if(userJson) {
            userId = angular.fromJson(userJson).id;
        }

        var itemId = $routeParams.itemId;
        $scope.imageUrl = SERVICE_HOST_API_URL;

        $scope.ownItem = false;

        // fetch item on page load
        $http({
            url: SERVICE_HOST_API_URL + "shareitem/" + itemId,
            method: "GET",
            params: {
                clientId: CLIENT_ID
            }
        }).success(function (response) {

            $log.info(response.item);

            var price = response.item.price? (response.item.price.amount.amount /100) : null;
            var rentalStart = response.item.rentalPeriods?response.item.rentalPeriods.lowerEndpoint: null;
            var rentalEnd = response.item.rentalPeriods?response.item.rentalPeriods.upperEndpoint: null;

            $scope.item = {
                'id': response.item.id,
                'imageUuids': response.item.imageUuids,
                'itemDescription': response.item.itemDescription,
                'itemName': response.item.itemName,
                'price': price,
                'rentalStart': rentalStart,
                'rentalEnd': rentalEnd,
                'userId': response.item.ownerId
            }

            $scope.ownItem = ($scope.item.userId === userId);
            $log.info($scope.item);
        });


        $scope.updateItem = function(item) {
            $log.info(item);
//            $http.post(uploadUrl, JSON.stringify(item), {
//                headers: {
//                    'Content-Type': 'application/json',
//                    'Authorization': 'bearer ' + currentUser.accessToken}
//            });
        };

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
                    clientId: CLIENT_ID,
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