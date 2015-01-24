var myApp = angular.module('lend', []);

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        console.log(file + ":" + uploadUrl);

        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined,
                      'Authorization': 'bearer c2hhcmUyMDE0LTEyLTE0VDE3OjU3OjMzLjI5MloxNTE4ODgwMjU1'}
            })
            .success(function(){
            })
            .error(function(){
            });
    }
}]);

myApp.controller('uploadController', ['$scope', 'fileUpload', function($scope, fileUpload){

    $scope.uploadFile = function(){
        var file = $scope.myFile;
        console.log('file is ' + JSON.stringify(file));
        var uploadUrl = "https://ec2-54-173-114-114.compute-1.amazonaws.com/image?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };

}]);
