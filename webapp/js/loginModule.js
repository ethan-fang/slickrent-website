var loginApp = angular.module('login', []);

loginApp.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

loginApp.service('Session', function () {
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


loginApp.factory('authService', ['$http', 'Session', function authServiceFactory($http, Session) {
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
            .then(function(res) {
                Session.create(res.data.user.id, res.data.user.accessToken, 'role');
                return res.data.user;
            });
    };

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


loginApp.controller('LoginController', ['$scope', '$rootScope', '$log', '$window', 'AUTH_EVENTS', 'authService',
    function($scope, $rootScope, $log, $window, AUTH_EVENTS, authService){

    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.currentUser = JSON.parse($window.sessionStorage.getItem('currentUser'));

    $scope.login = function (credentials) {
        authService.login(credentials).then(function (user) {
            $window.sessionStorage.setItem('currentUser', JSON.stringify(user));
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(user);
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    };

    $scope.setCurrentUser = function(user) {
        $scope.currentUser = user;
    }
}]);
