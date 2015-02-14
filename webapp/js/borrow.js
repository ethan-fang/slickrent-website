var borrowApp = angular.module('borrow', ['ngRoute', 'itemControllers']);


var SERVICE_HOST = "http://localhost:8080/api/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/api/"


borrowApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/item/:itemId', {
                templateUrl: 'partials/item-detail.html',
                controller: 'ItemDetailCtrl'
            }).
            when('/item', {
                templateUrl: 'partials/item-list.html',
                controller: 'ItemListCtrl'
            }).
            otherwise({
                redirectTo: '/item'
            });
    }
]);

