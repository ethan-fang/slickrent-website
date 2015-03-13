var profileModule = angular.module('profileModule', []);


profileModule.controller('ProfileController', ['$scope', '$log', function($scope, $log) {

    $scope.tabSelected = "#tab1";
    $scope.tabChange = function(e){
        $log.info(e);
        if (e.target.nodeName === 'A') {
            $scope.tabSelected = e.target.getAttribute("href");
            e.preventDefault();
        }
    }
}]);
