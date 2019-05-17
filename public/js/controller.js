enemaApp.controller('enemaController',['$scope','$location','$localStorage','$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','$routeParams','$window','fileReader','$route',
function($scope,$location,$localStorage,$firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,$routeParams,$window,fileReader,$route){
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
    $scope.multiImages = [];
    $scope.multiImagesSrc = [];
    $scope.month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    $scope.days = ['Monday','Tuesday','Wedensday','Thursday','Friday','Saturday','Sunday'];
    $scope.preDefineCourse = ['Laptop','Pendrive','Camera','Notebook'];
    $scope.courseTimeSlots = [{
        slot_date:'21',
        slot_day:'Tuesday',
        slot_month:'April',
        slot_year:'2019',
        TIME_SLOT:[{
            time_from:'2 AM',
            time_to:'4 PM',
            time_slot_limit:"5"
        }]
    }];
    $scope.reqImageArray={};
    $scope.selectedCourse = [{
        req_image:'',
        req_name:''
    }];
    $scope.adMediaFile = [];
    $scope.cancelledBooked = 0;
    $scope.bknList = [];
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
    $scope.signOut = function(){
        $scope.fAuth.$signOut();
        $scope.$lcl.uid = null;
        $location.path('/login');
    }
    /******Dahsboard Functions********/
    $scope.dashboardData = function(){
        var bookingObject = $scope.fDB.ref('APP_DATA').child('BOOKINGS_CANCEL');
        var obj = $firebaseObject(bookingObject);
        obj.$loaded().then(function() {
            $scope.bookingCanel = obj;
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
    $scope.toggleSelection = function toggleSelection(courseRName) {
        var idx = $scope.selectedCourse.indexOf(courseRName);
        if (idx > -1) {
          $scope.selectedCourse.splice(idx, 1);
        }
        else {
          $scope.selectedCourse.push(courseRName);
        }
    };
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
                $window.location.reload();
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
    /****** Courses Functions ******/
    $scope.getCoursesList = function(){
        var coursesObject = $scope.fDB.ref('APP_DATA').child('COURSES_DATA');
        $scope.courseList = $firebaseArray(coursesObject);
        var categoryObject = $scope.fDB.ref('APP_DATA').child('CATEGORIES_DATA');
        $scope.ccList = $firebaseArray(categoryObject);
        var cityObject = $scope.fDB.ref('APP_DATA').child('AVAILABLE_LOCATIONS');
        $scope.CourseCityList = $firebaseArray(cityObject);
    };
    $scope.addTimeSlot = function(index){
        index.TIME_SLOT.push({
            time_from:'2 AM',
            time_to:'4 PM',
            time_slot_limit:"5"
        });
    };
    $scope.addFullSlot = function(){
        $scope.courseTimeSlots.push({
            slot_date:'21',
            slot_day:'Tuesday',
            slot_month:'April',
            slot_year:'2019',
            TIME_SLOT:[{
                time_from:'2 AM',
                time_to:'4 PM',
                time_slot_limit:"5"
            }]
        });
    };
    $scope.addRequirment = function(){
        $scope.selectedCourse.push({
            req_image:'',
            req_name:''
        });
    }
    $scope.removeRequirment = function(index){
        $scope.selectedCourse.splice(index,1);
    }
    $scope.removeTimeSlot = function(cts,index){
        cts.TIME_SLOT.splice(index,1);
    }
    $scope.removeFullSlot = function(index){
        $scope.courseTimeSlots.splice(index,1);
    }
    $scope.editCourse = function(key){
        $scope.course_name = key.course_name;
        $scope.course_city = key.course_city;
        $scope.course_location = key.course_location;
        $scope.workshop_dec = key.course_desc;
        $scope.course_price = key.course_actual_price;
        $scope.course_d_price = key.course_discount_price;
        $scope.course_slot_note = key.NOTES.SLOT_NOTE;
        $scope.course_category = key.course_category;
        $scope.courseTimeSlots = key.COURSE_SLOT;
        $scope.selectedCourse = key.COURSE_REQUIRED;
        $scope.worksop_rating = key.course_rating;
        $scope.course_id = key.course_id;
        $scope.rating_count = key.course_rating_count;
        $scope.course_best_seller_status = key.course_best_seller_status;
        $scope.currentKeyEditing = key;
    }
    $scope.saveCourse = function(){
        $scope.isLoading = true;
        if($scope.currentKeyEditing){
            var WSObject = $scope.fDB.ref('APP_DATA').child('COURSES_DATA').child($scope.currentKeyEditing);
            var obj = $firebaseObject(WSObject);
            obj.course_name=$scope.course_name;
            obj.course_city=$scope.course_city;
            obj.course_desc=$scope.workshop_dec;
            obj.course_area=$scope.course_location;
            obj.course_actual_price=$scope.course_price;
            obj.course_discount_price=$scope.course_d_price;
            obj.course_category = $scope.course_category;
            obj.COURSE_REQUIRED=courseRequiredData;
            obj.course_image=url;
            obj.course_rating=$scope.worksop_rating;
            obj.course_id=$scope.course_id;
            obj.course_rating_count=$scope.rating_count;
            obj.COURSE_SLOT=$scope.courseTimeSlots;
            obj.course_best_seller_status=$scope.course_best_seller_status;
            obj.NOTES = {SLOT_NOTE:$scope.course_slot_note}
            obj.$save().then(function(ref) {
                $scope.showNoti(200,"Workshop Updated");
                $scope.isLoading = false;
                if($scope.reqImageArray.length>0){

                }
                //$location.reload();
                ref.key === obj.$id; // true
            }, function(error) {
                $scope.showNoti(404,error);
            });
        }
        else{
            var courseObject = $scope.fDB.ref('APP_DATA').child('COURSES_DATA');
            var coursePredefinedData =[];
            var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.mediaFile.name);
            var f_storage = $firebaseStorage(f_storageRef);
            var uploadTask = f_storage.$put($scope.mediaFile);
            uploadTask.$complete(snapshot=>{
                var imagePath = $scope.fStorage.ref("availble_locations_image/"+$scope.mediaFile.name);
                $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                    var totalCount = ($scope.courseList.length)+1;
                    var courseRequiredData = $scope.selectedCourse;
                    var csrObj = $firebaseObject(courseObject.child(''+totalCount+''));
                    csrObj.course_name=$scope.course_name;
                    csrObj.course_city=$scope.course_city;
                    csrObj.course_desc=$scope.workshop_dec;
                    csrObj.course_area=$scope.course_location;
                    csrObj.course_actual_price=$scope.course_price;
                    csrObj.course_discount_price=$scope.course_d_price;
                    csrObj.course_category = $scope.course_category;
                    csrObj.COURSE_REQUIRED=courseRequiredData;
                    csrObj.course_image=url;
                    csrObj.course_rating='4.5';
                    csrObj.course_id=''+totalCount+'';
                    csrObj.course_rating_count=""+Math.floor((Math.random() * 300) + 500)+"";
                    csrObj.COURSE_SLOT=$scope.courseTimeSlots;
                    csrObj.course_best_seller_status='1';
                    csrObj.NOTES = {SLOT_NOTE:$scope.course_slot_note}
                    csrObj.$save().then(function(ref){
                        $scope.addedKey = ref.key;
                    });
                    for(var i = 0;i<$scope.multiImages.length;i++){
                        (function(k){
                            var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.multiImages[k].name);
                            var f_storage = $firebaseStorage(f_storageRef);
                            var uploadTask = f_storage.$put($scope.multiImages[k]);
                            uploadTask.$complete(snapshot=>{
                                var imagePath = $scope.fStorage.ref(snapshot.metadata.fullPath);
                                $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                                    var courseDataGallery =  courseObject.child($scope.addedKey).child('COURSE_GALLERY');
                                    $firebaseArray(courseDataGallery).$add(url);
                                    if(k == ($scope.multiImages.length-1)){
                                        $scope.showNoti(200,'Course Added Successfully');
                                        $scope.isLoading = false;
                                        $scope.mediaFile = [];
                                        $scope.multiImages = [];
                                        $scope.multiImagesSrc = [];
                                        $scope.addedKey = '';
                                        $window.location.reload();
                                    }
                                });
                            });
                        })(i);
                    }
                });
            });
            uploadTask.$error(err=>{
                console.error(err);
                $scope.isLoading = false;
            });
        }
        
    };
    $scope.deleteCourse = function(key){
        var confirmThis = confirm("Do you want to delete this course?");
        if(confirmThis){
            $scope.showNoti(200,"Course Deleted");
            $scope.courseList.$remove(key);
        }
    };
    $scope.galleryImage = function(event){
        for(var i = 0;i<event.target.files.length;i++){
            $scope.multiImages.push(event.target.files[i]);
            fileReader.readAsDataUrl(event.target.files[i], $scope).then(function(result) {
                $scope.multiImagesSrc.push(result);
            });
        }
    };
    $scope.removeGImage = function(index){
        $scope.multiImages.splice(index,1);
        $scope.multiImagesSrc.splice(index,1);
        if($scope.multiImagesSrc.length < 1){
            $scope.course_gallery = '';
        }
    };
    /****** Ads Functions ******/
    $scope.getAdsList = function(){
        var adsObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA');
        var obj = $firebaseObject(adsObject);
        obj.$loaded().then(function() {
            $scope.ad_deals = obj.AD_DEALS;
            $scope.ad_sliders = obj.AD_SLIDER;
            $scope.ad_home_screen_ads = obj.HOME_SCREEN_ADS.TOP_SCREEN;
        });
    }
    $scope.saveAdSlider = function(){
        $scope.isLoading = true;
        for(var i = 0;i<$scope.adMediaFile.length;i++){
            if($scope.adMediaFile[i]){
                (function(k){
                    var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.adMediaFile[k].name);
                    var f_storage = $firebaseStorage(f_storageRef);
                    var uploadTask = f_storage.$put($scope.adMediaFile[k]);
                    uploadTask.$complete(snapshot=>{
                        var imagePath = $scope.fStorage.ref(snapshot.metadata.fullPath);
                        $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                            var catDObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER').child(k);
                            var obj = $firebaseObject(catDObject);
                            obj.ad_image = url;
                            obj.$save().then((res)=>{
                            });
                            if(k == ($scope.adMediaFile.length-1)){
                                $scope.showNoti(200,'Ad Slider updated Successfully');
                                $scope.isLoading = false;
                                $window.location.reload();
                            }
                        });
                    });
                })(i);
            }
        }
    }
    $scope.changeAdImage = function(event,index){
        $scope.adMediaFile[index] = event.target.files[0];
    }
    /****** Settings Functions ******/
    $scope.getSettings = function(){
        var supportObject = $scope.fDB.ref('APP_DATA').child('SUPPORT');
        $scope.supportData = $firebaseArray(supportObject);
        var referObject = $scope.fDB.ref('APP_DATA').child('REFERANDEARN');
        var referMessage = $firebaseObject(referObject);
        referMessage.$loaded().then(function() {
            $scope.referMessage = referMessage.refer_message;
        });
        
    }
    /****** Coupons Functions ******/
    $scope.getCouponsList = function(){
        var couponbject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES');
        var obj = $firebaseObject(couponbject);
        var cpnObj = [];
        $scope.cpnKeys = [];
        obj.$loaded().then(function() {
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function(value, key) {
                cpnObj.push(value);
               $scope.cpnKeys.push(key);
            });
        });
        $scope.cpnList = cpnObj;
        obj.$bindTo($scope, "cpnList");
    }
    /****** Coupons Functions ******/
    $scope.getBookingList = function(){
        var bookingObject = $scope.fDB.ref('USER_DATA').child('USERS_BOOKINGS');
        bookingObject.equalTo("cancelled").once("value", function(snapshot) {
            console.log(snapshot);
        });
        var obj = $firebaseObject(bookingObject);
        var bknObj = [];
        $scope.bknKeys = [];
        
        obj.$loaded().then(function() {
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function(value, key) {
                var userDataArray = $scope.fDB.ref('USER_DATA').child('USER_PROFILE').child(key);
                var userData = $firebaseObject(userDataArray);
                userData.$loaded().then(function() {
                    angular.forEach(value,function(v,k){
                        $scope.bknKeys.push(key);
                        $scope.bknList.push({
                            booking_course_name:v.booking_course_name,
                            booking_image:v.booking_image,
                            booking_course_location:v.booking_course_location,
                            booking_for:v.booking_for,
                            booking_rating:v.booking_rating,
                            booking_daydate:v.booking_daydate,
                            booking_time:v.booking_time,
                            course_fee:v.course_fee,
                            booking_status:v.booking_status,
                            uname:userData.full_name
                        });
                    });
                });
            });
            //$scope.bknList = bknObj;
        });
        
        //obj.$bindTo($scope, "bknList");
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