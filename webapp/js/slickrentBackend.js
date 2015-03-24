var slickrentBackendApp = angular.module('slickrentBackend', []);

slickrentBackendApp.service('itemUpload', ['$http', '$log',
    function ($http, $log) {
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + currentUser.accessToken}
            });
        };

}]);

slickrentBackendApp.service('userUpload', ['$http', '$log',
    function($http, $log) {

        this.updateProfile = function(profile, currentUser) {
            $log.info(JSON.stringify(profile));

            var updateUrl = SERVICE_HOST_API_URL + "user/profile/" + currentUser.id;
            return $http.put(updateUrl, JSON.stringify(profile), {
                params: {
                    clientId: CLIENT_ID
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + currentUser.accessToken}
            });
        };




        this.getCurrentProfile = function(currentUser) {
            return $http({
                url: SERVICE_HOST_API_URL + "user/profile/" + currentUser.id,
                method: "GET",
                params: {
                    clientId: CLIENT_ID
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + currentUser.accessToken
                }
            });
        };


}]);