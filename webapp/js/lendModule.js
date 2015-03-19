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

lendApp.directive('validFile',function(){
    return {
        link:function(scope,el,attrs,ngModel){
            el.bind('change',function(){
                scope.$apply(function(){
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
});

lendApp.service('itemUpload', ['$http', '$log', function ($http, $log) {

    var prepareItem = function(rawItem, imageUuids) {
        var itemToUpload = {};
        itemToUpload.itemName = rawItem.name;
        itemToUpload.itemDescription = rawItem.description;
        itemToUpload.pricePerHour = rawItem.price;
        itemToUpload.images = imageUuids;
        itemToUpload.quantity = 1;
        itemToUpload.rentalPeriods = [{
            "lowerBoundType": "CLOSED",
            "lowerEndpoint": rawItem.rentalStart.toISOString(),
            "upperBoundType": "CLOSED",
            "upperEndpoint": rawItem.rentalEnd.toISOString()
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
        var file = $scope.item.image;
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
