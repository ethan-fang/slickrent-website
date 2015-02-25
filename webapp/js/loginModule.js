var loginModule = angular.module('loginModule', []);

loginModule.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

loginModule.service('Session', function () {
    this.create = function(sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
    };

    this.destroy = function() {
        this.id = null;
        this.userId = null;
        this.userRole = null;
    };
    return this;
});


loginModule.factory('authService', ['$http', '$window', '$log', '$rootScope', 'Session', 'AUTH_EVENTS',
    function($http, $window, $log, $rootScope, Session, AUTH_EVENTS) {
        var authService = {};

        authService.login = function(credentials) {
            return $http({
                    method: 'POST',
                    url: SERVICE_HOST + 'user/signin?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc',
                    header: {
                        'Content-Type': 'applicaiton/json'
                    },
                    data: {
                        'username': credentials.email,
                        'password': credentials.password
                    }
                })
                .then(function (response) {
                    Session.create(response.data.user.id, response.data.user.accessToken, 'role');
                    $window.sessionStorage.setItem('currentUser', JSON.stringify(response.data.user));

                    //on login success, broadcast
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function () {
                    //on login fail, broadcast
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
        };

        authService.logout = function() {
            $log.info('logout from authservice');
            Session.destroy();
            $window.sessionStorage.removeItem('currentUser');

            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }

        authService.isAuthenticated = function() {
            return !!Session.userId;
        };

        authService.isAuthorized = function(authorizedRoles) {
            if (! angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
        };

        return authService;

}]);


loginModule.controller('LoginController', ['$scope', '$rootScope', '$log', '$window', 'AUTH_EVENTS', 'authService', 'Session',
    function($scope, $rootScope, $log, $window, AUTH_EVENTS, authService, Session){

        var setCurrentUserFromSession = function() {
            var userJson = $window.sessionStorage.getItem('currentUser');

            if(userJson) {
                $scope.currentUser = JSON.parse(userJson);
            }
        };

        $scope.credentials = {
            email: '',
            password: ''
        };

        setCurrentUserFromSession();

        $scope.login = function (credentials) {
            authService.login(credentials);
        };

        $scope.logout = function() {
            authService.logout();
        }

        $scope.$on(AUTH_EVENTS.loginSuccess, function() {
            setCurrentUserFromSession()
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $scope.currentUser = null;
        });

    }
]);
