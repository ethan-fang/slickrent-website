var borrowApp = angular.module('borrow', ['ngRoute', 'itemControllers']);

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

