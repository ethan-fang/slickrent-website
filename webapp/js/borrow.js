var borrowApp = angular.module('borrow', []);


borrowApp.controller('borrowController', ['$scope', '$log', '$http', function($scope, $log, $http){

    this.items = [
        {name: 'abc', description: 'description', price: '$5'},
        {name: 'abc', description: 'description', price: '$5'},
        {name: 'abc', description: 'description', price: '$5'},
        {name: 'abc', description: 'description', price: '$5'},
        {name: 'abc', description: 'description', price: '$5'}
    ];




    var fetchItems = function() {
        $log.info("fetching data");
        $http.get("https://ec2-54-173-114-114.compute-1.amazonaws.com/shareitem?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc&size=2")
            .success(function (data) {
//                this.items = data;
                $log.info(data);
             });
    };

    fetchItems($http);

}]);


//app.service('feedbackService', function ($http) {
//    this.getFeedbackPaged = function (nodeId, pageNumber, take) {
//        return $http.get('myUrl');
//    };
//});
//
//app.controller('feedbackController', function ($scope, feedbackService, $filter) {
//// Constructor for this controller
//    init();
//
//    function init() {
//        feedbackService.getFeedbackPaged(1234, 1, 20).then(function(data){$scope.feedbackItems=data;});
//    }
//});


