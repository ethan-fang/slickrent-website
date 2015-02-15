var lendApp = angular.module('lend', ['ui.bootstrap.datetimepicker']);



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

    this.uploadImage = function(file, imageUuid, uploadUrl, $scope){
        var fd = new FormData();
        fd.append('image', file);
        fd.append('imageUuid', imageUuid);
        return $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'bearer c2hhcmUyMDE0LTEyLTE0VDE3OjU3OjMzLjI5MloxNTE4ODgwMjU1'}
            });
    };

    this.uploadItem = function(item, imageUuids, uploadUrl, $scope) {
        var itemToUpload = prepareItem(item, imageUuids);

        $log.info(itemToUpload);

        return $http.post(uploadUrl, JSON.stringify(itemToUpload), {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer c2hhcmUyMDE0LTEyLTE0VDE3OjU3OjMzLjI5MloxNTE4ODgwMjU1'}
        });
    };


}]);

lendApp.controller('UploadController', ['$scope', '$log', 'itemUpload', function($scope, $log, itemUpload){
    var getUuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    $scope.uploadSuccess = false;
    $scope.uploadItem = function(item) {
        var file = item.image;
        var imageUuid = getUuid();
        var uploadUrl = SERVICE_HOST + "image?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc";
        itemUpload.uploadImage(file, imageUuid, uploadUrl, $scope)
            .then(function(response) {
                $log.info("image upload succeeded");
                var itemUploadUrl = SERVICE_HOST + 'shareitem/7ffc2295-6875-4f40-bc65-827b8fd4535b?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc';
                return itemUpload.uploadItem(item, [imageUuid], itemUploadUrl, $scope);
            })
            .then(function(response) {
                $log.info("item upload succeeded");
                $scope.uploadSuccess = true;
                $scope.item = null;
            });
    };
}]);
