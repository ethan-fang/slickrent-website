//var SERVICE_HOST = "http://localhost:8080/api/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/api/"
var SERVICE_HOST = "http://ec2-54-173-114-114.compute-1.amazonaws.com:9001/api/"


var slickrentApp = angular.module('slickrent',
    ['header', 'footer', 'lend', 'borrow', 'loginModule', 'profileModule', 'ui.bootstrap.datetimepicker', 'ngRoute']);

slickrentApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'partials/home.html'
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
            when('/profile', {
                templateUrl: 'partials/profile.html'
            }).
            when('/my-item', {
                templateUrl: 'partials/item-list.html',
                controller: 'ItemListCtrl',
                filter: {userSpecific: true}
            }).
            otherwise({
                redirectTo: '/home'
            });
    }
]);

slickrentApp.controller("HomepageController", ['$scope', '$log',
    function($scope, $log){
        $scope.expand =  function(ev) {
            var element = ev.srcElement ? ev.srcElement : ev.target;
            $log.info(element, angular.element(element))
        }
    }
]);


