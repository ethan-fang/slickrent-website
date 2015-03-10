var loginModule = angular.module('loginModule', ['ngFacebook']);


// setup facebook login
loginModule
.config( function($facebookProvider) {
   $facebookProvider.setAppId("770792652979234")

})
.run(function($rootScope) {
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});

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
                });
        };

        authService.logout = function() {
            Session.destroy();
            $window.sessionStorage.removeItem('currentUser');

            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };

        authService.signUp = function(signUpInfo) {
            return $http({
                method: 'POST',
                url: SERVICE_HOST + 'user/signup?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc',
                header: {
                    'Content-Type': 'applicaiton/json'
                },
                data: {
                    'username': signUpInfo.email,
                    'password': signUpInfo.password
                }
            });
        };


        authService.socialLogin = function(loginInfo) {
            return $http({
                method: 'POST',
                url: SERVICE_HOST + 'user/social-login?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc',
                header: {
                    'Content-Type': 'applicaiton/json'
                },
                data: {
                    'username': loginInfo.username,
                    'token': loginInfo.token,
                    'loginPlatform': 'FB'
                }
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


loginModule.controller('LoginController', ['$scope', '$rootScope', '$log', '$window', 'AUTH_EVENTS', 'authService', 'Session', '$facebook',
    function($scope, $rootScope, $log, $window, AUTH_EVENTS, authService, Session, $facebook){

        var setCurrentUserFromSession = function() {
            var userJson = $window.sessionStorage.getItem('currentUser');

            if(userJson) {
                $scope.currentUser = JSON.parse(userJson);
            }
        };

        var fbRefresh = function() {
//            $log.info($facebook.getAuthResponse());
            $facebook.api("/me").then(
                function(response) {
                    // response: {id: "10204406685581735", email: "xin_041619@hotmail.com", first_name: "xinxin", gender: "male", last_name: "wang"…}

                    authService.socialLogin({'username': response.name, 'token': $facebook.getAuthResponse().accessToken}).then(function () {
                        Session.create(response.id, "token", 'role');
                        $window.sessionStorage.setItem('currentUser', JSON.stringify({'username': response.name, 'email': response.email}));

                        //on login success, broadcast
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    });
                },
                function(err) {
                    $scope.welcomeMsg = "Please log in";
                    $log.error("please log in first");
                });
        };


        $scope.credentials = {
            email: '',
            password: ''
        };

        $scope.signUpInfo = {
            email: '',
            password: ''
        };

        setCurrentUserFromSession();

        $scope.login = function (credentials) {
            authService
                .login(credentials)
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

        $scope.fbLogin = function() {
            $facebook.login().then(function() {
                fbRefresh();
            });
        };


        $scope.logout = function() {
            authService.logout();
        };

        $scope.signUp = function(signUpInfo) {
            authService
                .signUp(signUpInfo)
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

        $scope.$on(AUTH_EVENTS.loginSuccess, function() {
            setCurrentUserFromSession()
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $scope.currentUser = null;
        });

    }
]);
