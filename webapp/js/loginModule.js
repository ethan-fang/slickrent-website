var loginModule = angular.module('loginModule', ['ngFacebook']);


// setup facebook login
loginModule
.config( function($facebookProvider) {
    $facebookProvider.setVersion("v2.3");
    $facebookProvider.setAppId(FACEBOOK_APP_ID);
    $facebookProvider.setPermissions("user_about_me, user_photos")
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
                    url: SERVICE_HOST_API_URL + 'user/signin?clientId=' + CLIENT_ID,
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
                url: SERVICE_HOST_API_URL + 'user/signup?clientId=' + CLIENT_ID,
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
                url: SERVICE_HOST_API_URL + 'user/social-login?clientId=' + CLIENT_ID,
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


loginModule.controller('LoginController', ['$scope', '$rootScope', '$log', '$window', 'AUTH_EVENTS', 'authService', 'Session', '$facebook', '$location',
    function($scope, $rootScope, $log, $window, AUTH_EVENTS, authService, Session, $facebook, $location){

        var setCurrentUserFromSession = function() {
            var userJson = $window.sessionStorage.getItem('currentUser');

            if(userJson) {
                $scope.currentUser = JSON.parse(userJson);
            }
        };

        var fbRefresh = function() {

            $facebook.api("/me").then(
                function(meResponse) {
                    $facebook
                        .api("/" + meResponse.id + "/picture")
                        .then(
                        function (pictureResponse) {
                            $log.info(pictureResponse);
                            var profilePhotoUrl = pictureResponse.data.url;
                            authService
                                .socialLogin({'username': meResponse.name, 'token': $facebook.getAuthResponse().accessToken})
                                .then(function (socialLoginResponse) {
                                    Session.create(meResponse.id, "token", 'role');
                                    $window.sessionStorage.setItem(
                                        'currentUser',
                                        JSON.stringify({
                                            'username': meResponse.name,
                                            'email': meResponse.email,
                                            'accessToken': socialLoginResponse.data.user.accessToken,
                                            'id': socialLoginResponse.data.user.id,
                                            'profilePhotoUrl': profilePhotoUrl
                                        }));

                                    //on login success, broadcast
                                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                                });


                        }, function (error) {
                            $log.error("picture request failed with response: " + error);
                            $scope.welcomeMsg = "Please log in";
                        });
                }, function(meError){
                    $log.error("me request failed with response: " + meError);
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
                    response.data.user.profilePhotoUrl = "img/defaultProfilePhoto.jpg"; // default profile photo
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
            setCurrentUserFromSession();

            // redirect to the homepage
            $location.path('#/home')
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $scope.currentUser = null;
        });

    }
]);
