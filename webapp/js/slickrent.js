var SERVICE_HOST = "http://localhost:8080/api/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/api/"


var slickrentApp = angular.module('slickrent',
    ['header', 'footer', 'lend', 'borrow', 'login', 'ui.bootstrap.datetimepicker', 'ngRoute']);



slickrentApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/index', {
                templateUrl: 'partials/index.html'
            }).
            when('/lend', {
                templateUrl: 'partials/lend.html'
            }).
            when('/borrow', {
                templateUrl: 'partials/item-list.html'
            }).
            when('/login', {
                templateUrl: 'partials/login.html'
            }).
            otherwise({
                redirectTo: '/index'
            });
    }
]);
