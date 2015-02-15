var headerModule = angular.module('header', []);

headerModule.controller('HeaderController', ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window) {
    $scope.currentUser = JSON.parse($window.sessionStorage.getItem('currentUser'));


    $scope.logout = function() {
        $window.sessionStorage.removeItem('currentUser');
        $scope.currentUser = null;
    }


}]);

