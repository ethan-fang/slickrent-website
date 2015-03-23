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

lendApp.directive('validFile', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
            ngModel.$render = function () {
                ngModel.$setViewValue(el.val());
            };

            el.bind('change', function () {
                scope.$apply(function () {
                    ngModel.$render();
                });
            });
        }
    };
});

lendApp.service('itemUpload', ['$http', '$log', function ($http, $log) {

    var prepareItem = function(rawItem, imageUuids) {
        var itemToUpload = {};
        itemToUpload.itemName = rawItem.name;
        itemToUpload.itemDescription = rawItem.description;
        itemToUpload.pricePerHour = rawItem.price;
        itemToUpload.images = imageUuids;
        itemToUpload.quantity = 1;

        var rentalPeriod;
        if(rawItem.rentalStart) {
            if(!rentalPeriod) {
                rentalPeriod = {};
            }
            rentalPeriod.lowerBoundType = "CLOSED";
            rentalPeriod.lowerEndpoint = rawItem.rentalStart.toISOString();
        }
        if(rawItem.rentalEnd) {
            if(!rentalPeriod) {
                rentalPeriod = {};
            }
            rentalPeriod.upperBoundType = "CLOSED";
            rentalPeriod.upperEndpoint = rawItem.rentalEnd.toISOString();
        }
        if(rentalPeriod) {
            itemToUpload.rentalPeriods = [rentalPeriod];
        }

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

    this.updateItem = function(item, imageUuids, uploadUrl, currentUser) {
        var itemToUpdate = prepareItem(item, imageUuids);
        $log.info(itemToUpdate);

        return $http.put(uploadUrl, JSON.stringify(itemToUpdate), {
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
    setCurrentUserFromSession();


    $scope.uploading = false;
    $scope.uploadSuccess = false;
    $scope.uploadItem = function(item, isValid) {

        if(!isValid) {
            $log.error("form is not valid");
            return;
        }

        $log.info(item);
        $scope.uploading = true;

        if(!$scope.currentUser) {
            $log.info("please login first before uploading");
            return;
        }

        var currentUser = $scope.currentUser;
        var file = $scope.item.imageContent;
        var imageUuid = getUuid();
        var imageUploadUrl = SERVICE_HOST_API_URL + "image?clientId=" + CLIENT_ID;
        itemUpload.uploadImage(file, imageUuid, imageUploadUrl, currentUser)
            .then(function(response) {
                $log.info("image upload succeeded");
                var itemUploadUrl = SERVICE_HOST_API_URL + 'shareitem/' + currentUser.id + '?clientId=' + CLIENT_ID;
                return itemUpload.uploadItem(item, [imageUuid], itemUploadUrl, currentUser);
            })
            .then(function(response) {
                $log.info("item upload succeeded");
                $scope.uploadSuccess = true;
                $scope.item = null;
                $scope.itemForm.$setPristine();
                $scope.uploading = false;
            }, function(response) {
                $log.info("item upload failed");
                $scope.uploadSuccess = false;
                $scope.uploading = false;
            });
    };


    $scope.$on(AUTH_EVENTS.loginSuccess, function() {
        setCurrentUserFromSession()
    });

    $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
        $scope.currentUser = null;
    });

}]);
