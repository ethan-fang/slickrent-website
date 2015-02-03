var lendApp = angular.module('lend', ['ui.bootstrap.datetimepicker']);


var SERVICE_HOST = "http://localhost:8080/"
//var SERVICE_HOST = "https://ec2-54-173-114-114.compute-1.amazonaws.com/"

lendApp.directive('fileModel', ['$parse', function ($parse) {
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

lendApp.service('itemUpload', ['$http', '$log', function ($http, $log) {
    var getUuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    var prepareItem = function(itemForm, imageUuids) {
        var itemToUpload = {};
        itemToUpload.itemName = itemForm.name;
        itemToUpload.itemDescription = itemForm.description;
        itemToUpload.pricePerHour = itemForm.price;
        itemToUpload.images = imageUuids;
        itemToUpload.quantity = 1;
        itemToUpload.rentalPeriods = [{
            "lowerBoundType": "CLOSED",
            "lowerEndpoint": itemForm.rentalStart.toISOString(),
            "upperBoundType": "CLOSED",
            "upperEndpoint": itemForm.rentalEnd.toISOString()
        }];

        return itemToUpload;
    };

    this.uploadImage = function(file, uploadUrl){

        var fd = new FormData();
        var imageUuid = getUuid();
        fd.append('image', file);
        fd.append('imageUuid', imageUuid);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'bearer c2hhcmUyMDE0LTEyLTE0VDE3OjU3OjMzLjI5MloxNTE4ODgwMjU1'}
            })
            .success(function(){
                console.log("image uploaded " + imageUuid);
            })
            .error(function(){
            });

        return [imageUuid];
    };

    this.uploadItem = function(item, imageUuids, uploadUrl, $scope) {


        var itemToUpload = prepareItem(item, imageUuids);

        $log.info(itemToUpload);

        $http.post(uploadUrl, JSON.stringify(itemToUpload), {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer c2hhcmUyMDE0LTEyLTE0VDE3OjU3OjMzLjI5MloxNTE4ODgwMjU1'}
        })
        .success(function(){
            $log.info("upload successful");
//                $scope.uploadSuccess = true;
                $scope.item = {};
            });
    };


}]);

lendApp.controller('uploadController', ['$scope', '$log', 'itemUpload', function($scope, $log, itemUpload){
    $scope.uploadSuccess = false;

    $scope.uploadImage = function(){
        var file = $scope.item.image;
        console.log('file is ' + JSON.stringify(file));
        var uploadUrl = SERVICE_HOST + "image?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc";
        return itemUpload.uploadImage(file, uploadUrl);
    };

    $scope.uploadItem = function(item) {
        // upload file
        var uploadedImageKeys = $scope.uploadImage();

        // upload the item
        var itemUploadUrl = SERVICE_HOST + 'shareitem/7ffc2295-6875-4f40-bc65-827b8fd4535b?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc';
        itemUpload.uploadItem(item, uploadedImageKeys, itemUploadUrl, $scope);

    };
}]);
