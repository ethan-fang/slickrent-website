var itemControllers = angular.module('itemControllers', ['xeditable', 'ui.bootstrap.datetimepicker', 'slickrentUtil']);

itemControllers.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});


itemControllers.controller('ItemDetailCtrl', ['$scope','$stateParams', '$http', '$log', '$window', 'itemUpload', 'slickrentUtil',
    function($scope, $stateParams, $http, $log, $window, itemUpload, slickrentUtil) {
        var currentUser = slickrentUtil.getCurrentUserFromSession($window);
        var itemId = $stateParams.itemId;

        $scope.imageUrl = SERVICE_HOST_API_URL;
        $scope.ownItem = false;
        $scope.updating = false;
        $scope.updateSuccess = false;


        // this method should only be visible for logged in user
        $scope.updateItem = function(item) {
            if(!currentUser) {
                $log.error("userId needs to be defined for updating an item");
            }

            $log.info(item);

            $scope.updating = true;
            $scope.updateSuccess = false;

            var itemUpdateUrl = SERVICE_HOST_API_URL + 'shareitem/' + currentUser.id + '/' + item.id +'?clientId=' + CLIENT_ID;
            itemUpload
                .updateItem(item, item.imageUuids, itemUpdateUrl, currentUser)
                .then(function(){
                    $scope.updating = false;
                    $scope.updateSuccess = true;

                    $log.info('update succeeded');
                }, function() {
                    $scope.updating = false;
                    $scope.updateSuccess = false;

                    $log.info('update failed');
                });
        };

        // run on load of page
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
            var rentalStart = response.item.rentalPeriod?response.item.rentalPeriod.lowerEndpoint: null;
            var rentalEnd = response.item.rentalPeriod?response.item.rentalPeriod.upperEndpoint: null;

            $scope.item = {
                'id': response.item.id,
                'imageUuids': response.item.imageUuids,
                'description': response.item.itemDescription,
                'name': response.item.itemName,
                'price': price,
                'rentalStart': new moment(rentalStart).toDate(),
                'rentalEnd': new moment(rentalEnd).toDate(),
                'userId': response.item.ownerId
            }

            $scope.ownItem = ($scope.item.userId === currentUser.id);
            $log.info($scope.item);
        });


    }
]);

itemControllers.controller('ItemListCtrl', ['$scope', '$http', '$log', '$state', '$window',
    function($scope, $http, $log, $state, $window) {
        var userId;
        if($state.current.data) {
            userId = $state.current.data.getCurrentUser($window).id;
        }

        $scope.serviceHostApiUrl = SERVICE_HOST_API_URL;

        $scope.items = [];
        $scope.loadMoreText = '';
        $scope.loadBusy = false;
        $scope.haveMore = true;
        $scope.state = $state.current.name;

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
                    $scope.haveMore = false;
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