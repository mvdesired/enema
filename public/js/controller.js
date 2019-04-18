enemaApp.controller('enemaController',['$scope','$location','$localStorage','$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','$routeParams','$window',
function($scope,$location,$localStorage,$firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,$routeParams,$window){
    $scope.$lcl = $localStorage;
    $scope.fAuth = $firebaseAuth();
    $scope.fDB = firebase.database();
    $scope.fStorage = firebase.storage();
    $scope.loginEmail = '';
    $scope.loginPassword = '';
    $scope.mainLoader = true;
    $scope.mediaFile = [];
    $scope.isLoading = false;
    $scope.isUploading = false;
    $scope.editCity = {};
    $scope.curCatKey = '';
    /**Initializing Init Function*********/
    $scope.init = function(){
        if(!$scope.isUserLoggedIn()){
            $location.path('/login');
        }
    }
    $scope.isUserLoggedIn = function(){
        if ($scope.$lcl.uid) {
            return true;
        }
    }
    $scope.login = function(){
        $scope.isLoading = true;
        $scope.fAuth.$signInWithEmailAndPassword($scope.loginEmail, $scope.loginPassword).then(function(result){
            $scope.showNoti(200,'Logged in Successfully');
            $scope.isLoading = false;
            $scope.$lcl.uid = result.user.uid;
            $location.path('/');
        }).catch(function(error) {
            $scope.isLoading = false;
            if(error.code=='auth/invalid-email'){
                $scope.showNoti(500,'Please enter a valid emailID');
            }
            else if(error.code == 'auth/operation-not-allowed'){
                $scope.showNoti(404,'This user is not allowed to login to admin panel');
            }
            else if(error.code == 'auth/user-not-found'){
                $scope.showNoti(404,'Email or password is incorrect');
            }
        });
    }
    /******Miscelleneous Functions********/
    $scope.showNoti = function(code,text){
        var className= '';
        if(code == 200){
            className = 'alert-success';
        }
        else if(code == 300){
            className = 'alert-info';
        }
        else if(code == 500){
            className = 'alert-warning';
        }
        else if(code == 404){
            className = 'alert-danger';
        }
        jQuery.notify({
            message: text
        },
        {
            type: className,
            allow_dismiss: true,
            newest_on_top: true,
            timer: 500,
            placement: {
                from: 'top',
                align: 'right'
            },
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0}  p-r-35" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
        });
    }
    $scope.getClass = function (path) {
        return ($location.path() === path) ? 'active' : '';
    }
    /********City Page Functions *********/
    $scope.getCityList = function(){
        var cityObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS');
        var obj = $firebaseObject(cityObject);
        var cityObj = [];
        $scope.cityKeys = [];
        obj.$loaded().then(function() {
           // To iterate the key/value pairs of the object, use angular.forEach()
           angular.forEach(obj, function(value, key) {
              cityObj.push({loc_key:key,location_name:value.location_name,location_image:value.location_image});
              $scope.cityKeys.push(key);
           });
         });
         $scope.cityList = cityObj;
         obj.$bindTo($scope, "cityList");
    }
    $scope.addCity = function(){
        var cityObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS');
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.mediaFile.name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put($scope.mediaFile);
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+$scope.mediaFile.name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $firebaseArray(cityObject).$add({
                    'location_name': $scope.location_name,
                    'location_image':url
                  });
                $scope.isUploading = false;
                $scope.showNoti(200,'City Added Successfully');
                $scope.isLoading = false;
                $scope.mediaFile = [];
                $window.reload();
              });
        });
        uploadTask.$progress(snapshot=>{
            var percentUploaded = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $scope.percentUploaded = percentUploaded;
            $scope.isUploading = true;
            $scope.isLoading = true;
        });
        uploadTask.$error(err=>{
            console.error(err);
        });
    }
    $scope.changeImage = function(event){
        $scope.mediaFile = event.target.files[0];
    }
    $scope.cityDetails = function(){
        $scope.mainLoader = true;
        var cityKey = $routeParams.key;
        var cityDObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS').child(cityKey);
        var obj = $firebaseArray(cityDObject);
        obj.$loaded().then(function() {
            $scope.editCity = {location_name:obj[1].$value,location_image:obj[0].$value};
            $scope.mainLoader = false;
        });
    }
    $scope.saveCity = function(){
        var cityKey = $routeParams.key;
        var cityDObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS').child(cityKey);
        var obj = $firebaseObject(cityDObject);
        obj.location_name = $scope.editCity.location_name;
        obj.location_image = $scope.editCity.location_image;
        obj.$save().then(function(ref) {
            $scope.showNoti(200,"City Updated");
            ref.key === obj.$id; // true
          }, function(error) {
            $scope.showNoti(404,error);
          });
    }
    $scope.deleteCity = function(key){
        var cityDObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS').child(key);
        var obj = $firebaseObject(cityDObject);
        obj.$remove().then(function(ref) {
            $scope.showNoti(200,"City Deleted");
        }, function(error) {
            console.log("Error:", error);
            $scope.showNoti(404,error);
        });
    }
    /****** Category Functions ******/
    $scope.getCategoryList = function(){
        var categoryObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA');
        var obj = $firebaseObject(categoryObject);
        var catObj = [];
        $scope.catKeys = [];
        obj.$loaded().then(function() {
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function(value, key) {
                catObj.push({category_name:value.category_name});
               $scope.catKeys.push(key);
            });
        });
        $scope.catList = catObj;
        obj.$bindTo($scope, "catList");
    }
    $scope.editCat = function(key){
        console.log(key);
        var catDObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA').child(key);
        var obj = $firebaseArray(catDObject);
        obj.$loaded().then(function() {
            $scope.category_name = obj[0].$value;
            $scope.curCatKey = key;
        });
    }
    $scope.saveCat = function(){
        $scope.isLoading = true;
        if($scope.curCatKey){
            var catDObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA').child($scope.curCatKey);
            var obj = $firebaseObject(catDObject);
            obj.category_name = $scope.category_name;
            obj.$save().then(function(ref) {
                $scope.showNoti(200,"Category Updated");
                $scope.curCatKey = '';
                $scope.category_name = '';
                $scope.isLoading = false;
                ref.key === obj.$id; // true
            }, function(error) {
                $scope.showNoti(404,error);
            });
        }
        else{
            var CatObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA');
            $firebaseArray(CatObject).$add({
                'category_name': $scope.category_name,
            });
            $scope.showNoti(200,'Category Added Successfully');
            $scope.category_name = '';
            $scope.isLoading = false;
        }
    }
    $scope.deleteCat = function(key){
        var catDObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA').child(key);
        var obj = $firebaseObject(catDObject);
        obj.$remove().then(function(ref) {
            $scope.showNoti(200,"Category Deleted");
        }, function(error) {
            console.log("Error:", error);
            $scope.showNoti(404,error);
        });
    }
    /****** Route Changes ********/
    $scope.$on('$routeChangeStart',function(scope, next, current){
        $scope.mainLoader = true;
    });
    $scope.$on('$routeChangeSuccess',function(scope, next, current){
        //$scope.currentPage = next.$route.originalPath;
        $scope.mainLoader = false;
    });
}]);