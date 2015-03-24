var profileModule = angular.module('profileModule', ['slickrentBackend', 'slickrentUtil']);


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
    $scope.updating = false;
    $scope.updateSuccess = false;

    $scope.updateProfile = function(profileForm) {
        $scope.updating = true;

        profileForm.photoUuid = slickrentUtil.randomUuid();

        userUpload
            .updateProfile(profileForm, currentUser)
            .then(
                function(response) {
                    $log.info(response);
                    $scope.updating = false;
                    $scope.updateSuccess = true;
                },
                function(response){
                    $log.info(response);
                    $scope.updating = false;
                    $scope.updateSuccess = false;
                }
            );
    };

    $scope.reset = function(){
        $scope.profile = {};
    }
}]);
