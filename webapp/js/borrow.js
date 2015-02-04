var borrowApp = angular.module('borrow', []);


var SERVICE_HOST = "http://localhost:8080/api/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/api/"


borrowApp.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        angular.element(window).bind('scroll', scope.loadMore);
    };
});

borrowApp.controller('borrowController', ['$scope', '$log', '$http', function($scope, $log, $http){

    $scope.items = [
    ];


    $scope.loadMore = function() {
        $log.info("load more");
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
}]);


