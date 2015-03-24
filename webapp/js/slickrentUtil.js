var slickrentUtil = angular.module('slickrentUtil', []);

slickrentUtil.service('slickrentUtil', ['$log', '$window',
    function($log, $window) {
        this.getCurrentUserFromSession =  function() {
            var userJson = $window.sessionStorage.getItem('currentUser');

            return userJson?angular.fromJson(userJson):undefined;
        };

        this.randomUuid = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };


    }
]);
