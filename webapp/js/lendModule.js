var lendApp = angular.module('lend', ['ui.bootstrap.datetimepicker', 'slickrentBackend', 'slickrentUtil']);


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

lendApp.controller('UploadController', ['$scope', '$log', '$window', 'itemUpload', 'AUTH_EVENTS', 'slickrentUtil', function($scope, $log, $window, itemUpload, AUTH_EVENTS, slickrentUtil){
    $scope.currentUser = slickrentUtil.getCurrentUserFromSession($window);
    $scope.uploading = false;
    $scope.uploadSuccess = false;

    $scope.uploadItem = function(item, isValid) {
        if(!isValid) {
            $log.error("form is not valid");
            return;
        }

        if(!$scope.currentUser) {
            $log.info("please login first before uploading");
            return;
        }

        $log.info(item);

        $scope.uploading = true;

        var currentUser = $scope.currentUser;
        var file = $scope.item.imageContent;
        var imageUuid = slickrentUtil.randomUuid();
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
