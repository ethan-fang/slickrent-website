var SERVICE_HOST_API_URL = "http://localhost:8080/api/";
//var SERVICE_HOST_API_URL = "http://54.84.57.3:9001/api/";
//var SERVICE_HOST_API_URL = "http://api.slickrent.space:9001/api/";

var CLIENT_ID='e7568b2c-2c0f-480e-9e34-08f9a4b807dc';


var slickrentApp = angular.module('slickrent',
    ['header', 'footer', 'lend', 'borrow', 'loginModule', 'profileModule', 'ui.bootstrap.datetimepicker', 'ui.router']);


slickrentApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");


    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "partials/home.html"
        })
        .state('lend', {
            url: "/lend",
            templateUrl: "partials/lend.html"
        })
        .state('items', {
            url: "/items",
            templateUrl: "partials/item-list.html"
        })
        .state('items-detail', {
            url: "/items/{itemId}",
            templateUrl: "partials/item-detail.html"
        })
        .state('my-items', {
            url: "/items",
            templateUrl: "partials/item-list.html",
            data: {
                personalized: true,
                getCurrentUser: function($window) {
                    return  angular.fromJson($window.sessionStorage.getItem('currentUser'));
                }
            }
        })
        .state('my-items-detail', {
            url: "/items/{itemId}",
            templateUrl: "partials/item-detail.html"
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html"
        })
        .state('profile', {
            url: "/profile",
            templateUrl: "partials/profile.html"
        });
});

slickrentApp.controller("HomepageController", ['$scope', '$log',
    function($scope, $log){
        $scope.expand =  function(ev) {
            var element = ev.srcElement ? ev.srcElement : ev.target;
            $log.info(element, angular.element(element))
        }
    }
]);


