var headerModule = angular.module('header', ['loginModule']);

headerModule.controller('HeaderController', ['$scope', '$rootScope', '$window', '$log', 'AUTH_EVENTS', 'authService',
    function($scope, $rootScope, $window, $log, AUTH_EVENTS, authService) {

        var setCurrentUserFromSession = function() {
            var userJson = $window.sessionStorage.getItem('currentUser');

            if(userJson) {
                $scope.currentUser = JSON.parse(userJson);
            }
        };

        setCurrentUserFromSession();


        $scope.logout = function() {
            authService.logout();
        };

        $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
            $scope.currentUser = null;
        });

        $scope.$on(AUTH_EVENTS.loginSuccess, function(){
            setCurrentUserFromSession();
        });


    }
]);

