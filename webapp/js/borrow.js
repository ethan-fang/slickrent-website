var borrowApp = angular.module('borrow', []);


var SERVICE_HOST = "http://localhost:8080/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/"


borrowApp.controller('borrowController', ['$scope', '$log', '$http', function($scope, $log, $http){

    $scope.items = [
//        {name: 'abc', description: 'description', price: '$5'},
//        {name: 'abc', description: 'description', price: '$5'},
//        {name: 'abc', description: 'description', price: '$5'},
//        {name: 'abc', description: 'description', price: '$5'},
//        {name: 'abc', description: 'description', price: '$5'}
    ];



    $http.get(SERVICE_HOST + "shareitem?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc&size=5")
         .success(function (response) {

        $scope.items = response.items;
        $log.info(response);
     });
}]);


