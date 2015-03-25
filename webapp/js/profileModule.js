var profileModule = angular.module('profileModule', ['slickrentBackend', 'slickrentUtil']);

profileModule.directive("compareTo", function(){
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});

profileModule.controller('ProfileController', ['$scope', '$log', 'userUpload', 'slickrentUtil', function($scope, $log, userUpload, slickrentUtil) {

    var currentUser = slickrentUtil.getCurrentUserFromSession();

    if(!currentUser) {
        $log.error("currentUser doesn't exist, need to login first");
    }

    // set init profile
    var initProfile;
    userUpload.getCurrentProfile(currentUser).success(function(response) {
        $log.info(response.profile);
        initProfile = response.profile;
        $scope.profile = initProfile;
    }) ;


    $scope.tabSelected = "#tab1";
    $scope.tabChange = function(e){
        $log.info(e);
        if (e.target.nodeName === 'A') {
            $scope.tabSelected = e.target.getAttribute("href");
            e.preventDefault();
        }
    }


    $scope.currentUser = currentUser;
    $scope.profileUpdating = false;
    $scope.profileUpdateSuccess = false;

    $scope.passwordUpdating = false;
    $scope.passwordUpdateSuccess = false;

    $scope.updateProfile = function(profileForm) {
        $scope.profileUpdating = true;

        profileForm.photoUuid = slickrentUtil.randomUuid();

        userUpload
            .updateProfile(profileForm, currentUser)
            .then(
                function(response) {
                    $log.info(response);
                    $scope.profileUpdating = false;
                    $scope.profileUpdateSuccess = true;
                },
                function(response){
                    $log.info(response);
                    $scope.profileUpdating = false;
                    $scope.profileUpdateSuccess = false;
                }
            );
    };

    $scope.updatePassword = function(password) {
        $log.info(password);
        $scope.passwordUpdating = true;

        userUpload
            .updatePassword(password.oldPassword, password.newPassword, currentUser)
            .then(
            function(response) {
                $log.info(response);
                $scope.passwordUpdating = false;
                $scope.passwordUpdateSuccess = true;
            },
            function(response){
                $log.info(response);
                $scope.passwordUpdating = false;
                $scope.passwordUpdateSuccess = false;
            }
        );
    }

    $scope.reset = function(toReset){
        toReset = {};
    }
}]);
