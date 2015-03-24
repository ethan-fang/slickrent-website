var SERVICE_HOST_API_URL = "http://localhost:8080/api/";
//var SERVICE_HOST_API_URL = "http://54.84.57.3:9001/api/";
//var SERVICE_HOST_API_URL = "http://api.slickrent.space:9001/api/";

var CLIENT_ID='e7568b2c-2c0f-480e-9e34-08f9a4b807dc';


var slickrentApp = angular.module('slickrent',
    ['slickrentBackend', 'header', 'footer', 'lend', 'borrow', 'loginModule', 'profileModule',
        'ui.bootstrap.datetimepicker', 'ui.router', 'ncy-angular-breadcrumb']);


slickrentApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");


    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "partials/home.html",
            ncyBreadcrumb: {
                label: 'Home page'
            }
        })
        .state('lend', {
            url: "/lend",
            templateUrl: "partials/lend.html",
            ncyBreadcrumb: {
                label: 'Lend Tools'
            }
        })
        .state('items', {
            url: "/items",
            templateUrl: "partials/item-list.html",
            onEnter: function(){
                console.log("enter items");
            },
            ncyBreadcrumb: {
                label: 'Browse tools'
            }
        })
        .state('items-detail', {
            url: "/items/{itemId}",
            templateUrl: "partials/item-detail.html",
            ncyBreadcrumb: {
                parent: 'items', // Override the parent state (only for the breadcrumb).
                label: "Tool details"
            },
            onEnter: function(){
                console.log("enter items-detail");
            }
        })
        .state('my-items', {
            url: "/my-items",
            templateUrl: "partials/item-list.html",
            data: {
                personalized: true,
                getCurrentUser: function($window) {
                    return  angular.fromJson($window.sessionStorage.getItem('currentUser'));
                }
            },
            ncyBreadcrumb: {
                label: 'My tools'
            }
        })
        .state('my-items-detail', {
            url: "/my-items/{itemId}",
            templateUrl: "partials/item-detail.html",
            ncyBreadcrumb: {
                parent: 'my-items', // Override the parent state (only for the breadcrumb).
                label: 'My tool details'
            }
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html",
            ncyBreadcrumb: {
                label: 'Login'
            }
        })
        .state('profile', {
            url: "/profile",
            templateUrl: "partials/profile.html",
            ncyBreadcrumb: {
                label: 'Profile'
            }
        });
});

slickrentApp.config(function($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        template: 'bootstrap3'
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


