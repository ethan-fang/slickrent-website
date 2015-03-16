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

    this.uploadImage = function(file, imageUuid, uploadUrl, currentUser){
        var fd = new FormData();
        fd.append('image', file);
        fd.append('imageUuid', imageUuid);
        return $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'bearer ' + currentUser.accessToken}
            });
    };

    this.uploadItem = function(item, imageUuids, uploadUrl, currentUser) {
        var itemToUpload = prepareItem(item, imageUuids);

        $log.info(itemToUpload);

        return $http.post(uploadUrl, JSON.stringify(itemToUpload), {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + currentUser.accessToken}
        });
    };


}]);

lendApp.controller('UploadController', ['$scope', '$log', '$window', 'itemUpload', 'AUTH_EVENTS', function($scope, $log, $window, itemUpload, AUTH_EVENTS){
    var getUuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    var setCurrentUserFromSession = function() {
        var userJson = $window.sessionStorage.getItem('currentUser');

        if(userJson) {
            $scope.currentUser = JSON.parse(userJson);
        }
    };

    $scope.uploadSuccess = false;
    $scope.uploadItem = function(item) {

        if(!$scope.currentUser) {
            $log.info("please login first before uploading");
            return;
        }

        var currentUser = $scope.currentUser;
        var file = item.image;
        var imageUuid = getUuid();
        var uploadUrl = SERVICE_HOST_API_URL + "image?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc";
        itemUpload.uploadImage(file, imageUuid, uploadUrl, currentUser)
            .then(function(response) {
                $log.info("image upload succeeded");
                var itemUploadUrl = SERVICE_HOST_API_URL + 'shareitem/' + currentUser.id + '?clientId=e7568b2c-2c0f-480e-9e34-08f9a4b807dc';
                return itemUpload.uploadItem(item, [imageUuid], itemUploadUrl, currentUser);
            })
            .then(function(response) {
                $log.info("item upload succeeded");
                $scope.uploadSuccess = true;
                $scope.item = null;
            });
    };

    setCurrentUserFromSession();

    $scope.$on(AUTH_EVENTS.loginSuccess, function() {
        setCurrentUserFromSession()
    });

    $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
        $scope.currentUser = null;
    });

}]);
