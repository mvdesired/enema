enemaApp.controller('enemaController',['$scope','$location','$localStorage','$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','$routeParams','$window','fileReader','$route',
function($scope,$location,$localStorage,$firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,$routeParams,$window,fileReader,$route){
    var newDate = new Date();
    var todayDate = newDate.getDate();
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
    $scope.usersList=[];
    $scope.userlist = [];
    $scope.multiImages = [];
    $scope.multiImagesSrc = [];
    $scope.ad_sliders = [];
    $scope.maxFileSize = 200;
    $scope.month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    $scope.days = ['Sunday','Monday','Tuesday','Wedensday','Thursday','Friday','Saturday'];
    $scope.preDefineCourse = ['Laptop','Pendrive','Camera','Notebook'];
    $scope.courseTimeSlots = [{
        slot_date:''+todayDate,
        slot_day:''+$scope.days[newDate.getDay()],//'Tuesday',
        slot_month:''+$scope.month[newDate.getMonth()], //'April',
        slot_id:'0',
        slot_year:''+newDate.getFullYear(),//'2019',
        TIME_SLOT:[{
            time_from:'2 AM',
            time_to:'4 PM',
            time_slot_limit:"5"
        }]
    }];
    $scope.reqImageArray=[];
    $scope.selectedCourse = [{
        req_image:'',
        req_name:'',
    }];
    $scope.adMediaFile = [];
    $scope.cancelledBooked = 0;
    $scope.bknList = [];
    $scope.bknCList = [];
    $scope.bknBList = [];
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
        var currentFile = event.target.files[0];
        var fileSize = currentFile.size/1024;
        if(fileSize > $scope.maxFileSize){
            alert('Please upload max file size 200KB');
            return false;
        }
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
            slot_date:''+todayDate,
            slot_day:''+$scope.days[newDate.getDay()],//'Tuesday',
            slot_month:''+$scope.month[newDate.getMonth()], //'April',
            slot_year:''+newDate.getFullYear(),//'2019',
            slot_id:''+$scope.courseTimeSlots.length,
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
        angular.forEach($scope.courseTimeSlots,function(v,k){
            v.slot_id = k;
        });
    }
    $scope.editCourse = function(key,$index){
        $scope.course_name = key.course_name;
        $scope.course_city = key.course_city;
        $scope.course_location = key.course_area;
        $scope.course_lat = key.course_lat;
        $scope.course_longi = key.course_longi;
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
        $scope.currentKeyEditing = $index+1;
    }
    $scope.saveCourse = function(){
        if(typeof($scope.course_name) == "undefined" || $scope.course_name == ''){
            alert("Workshop name should not be blank");
            return false;
        }
        if(typeof($scope.workshop_dec) == "undefined" || $scope.workshop_dec == ''){
            alert("Workshop description should not be blank");
            return false;
        }
        if(typeof($scope.course_city) == "undefined" || $scope.course_city == ''){
            alert("Workshop city should not be blank");
            return false;
        }
        if(typeof($scope.course_location) == "undefined" || $scope.course_location == ''){
            alert("Workshop location should not be blank");
            return false;
        }
        if(typeof($scope.course_price) == "undefined" || $scope.course_price == ''){
            alert("Workshop price should not be blank");
            return false;
        }
        if(typeof($scope.course_slot_note) == "undefined" || $scope.course_slot_note == ''){
            alert("Workshop slot note should not be blank");
            return false;
        }
        if(typeof($scope.course_category) == "undefined" || $scope.course_category == ''){
            alert("Workshop category should not be blank");
            return false;
        }
        if(!$scope.currentKeyEditing && typeof($scope.mediaFile.name) == "undefined" || $scope.mediaFile.name == ''){
            alert("Workshop image should not be blank");
            return false;
        }
        if(!$scope.currentKeyEditing && $scope.multiImages.length < 1){
            alert("Workshop gallery images should not be blank");
            return false;
        }
        if(!$scope.currentKeyEditing && $scope.reqImageArray.length < 1){
            alert("Workshop gallery images should not be blank");
            return false;
        }
        $scope.isLoading = true;
        $scope.mainLoader = true;
        if($scope.currentKeyEditing){
            var WSObject = $scope.fDB.ref('APP_DATA').child('COURSES_DATA').child($scope.currentKeyEditing);
            //var obj = $firebaseObject(WSObject);
            var obj = {};
            obj.course_name=$scope.course_name;
            obj.course_city=$scope.course_city;
            obj.course_desc=$scope.workshop_dec;
            obj.course_area=$scope.course_location;
            obj.course_actual_price=$scope.course_price;
            obj.course_discount_price=$scope.course_d_price;
            obj.course_category = $scope.course_category;
            //obj.COURSE_REQUIRED=courseRequiredData;
            //obj.course_image=url;
            obj.course_lat = $scope.course_lat;
            obj.course_longi = $scope.course_longi;
            obj.course_rating=$scope.worksop_rating;
            obj.course_id=$scope.course_id;
            obj.course_rating_count=$scope.rating_count;
            obj.course_best_seller_status=$scope.course_best_seller_status;
            for(var i = 0;i<$scope.courseTimeSlots.length;i++){
                delete $scope.courseTimeSlots[i].$$hashKey;
                if(typeof($scope.courseTimeSlots[i].TIME_SLOT) != "undefined"){
                    for(var j=0;j<$scope.courseTimeSlots[i].TIME_SLOT.length;j++){
                        delete $scope.courseTimeSlots[i].TIME_SLOT[j].$$hashKey;
                    }
                }
            }
            obj.COURSE_SLOT=$scope.courseTimeSlots;
            obj.NOTES = {SLOT_NOTE:$scope.course_slot_note};
            WSObject.update(obj);
            $scope.showNoti(200,'Course Added Successfully');
            $scope.isLoading = false;
            $scope.mainLoader = false;
            $window.location.reload();
            /*obj.$save().then(function(ref) {
                $scope.showNoti(200,"Workshop Updated");
                $scope.isLoading = false;
                if($scope.reqImageArray.length>0){

                }
                //$location.reload();
                ref.key === obj.$id; // true
            }, function(error) {
                $scope.showNoti(404,error);
            });*/
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
                    csrObj.COURSE_REQUIRED='';//courseRequiredData;
                    csrObj.course_image=url;
                    csrObj.course_rating='0';
                    csrObj.course_id=''+totalCount+'';
                    csrObj.course_rating_count=""+Math.floor((Math.random() * 300) + 500)+"";
                    csrObj.COURSE_SLOT=$scope.courseTimeSlots;
                    csrObj.course_best_seller_status='1';
                    csrObj.course_lat = $scope.course_lat;
                    csrObj.course_longi = $scope.course_longi;
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
                                        for(var j = 0;j<$scope.reqImageArray.length;j++){
                                            (function(m){
                                                var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.reqImageArray[m].name);
                                                var f_storage = $firebaseStorage(f_storageRef);
                                                var uploadTask = f_storage.$put($scope.reqImageArray[m]);
                                                uploadTask.$complete(snapshot=>{
                                                    var imagePath = $scope.fStorage.ref(snapshot.metadata.fullPath);
                                                    $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                                                        $scope.selectedCourse[m].req_image = url;
                                                        delete $scope.selectedCourse[m].$$hashKey;
                                                        var courseDataGallery =  courseObject.child($scope.addedKey).child('COURSE_REQUIRED');
                                                        $firebaseArray(courseDataGallery).$add({
                                                            req_name:$scope.selectedCourse[m].req_name,
                                                            req_image:url
                                                        });
                                                        if(m == ($scope.reqImageArray.length-1)){
                                                            $scope.showNoti(200,'Course Added Successfully');
                                                            $scope.isLoading = false;
                                                            $scope.mediaFile = [];
                                                            $scope.multiImages = [];
                                                            $scope.multiImagesSrc = [];
                                                            $scope.reqImageArray = [];
                                                            $scope.addedKey = '';
                                                            $scope.selectedCourse = [{
                                                                req_image:'',
                                                                req_name:'',
                                                            }];
                                                            $scope.mainLoader = false;
                                                            $window.location.reload();
                                                        }
                                                    });
                                                });
                                            })(j);
                                        }
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
    $scope.cancelCourseEditing = function(){
        $window.location.reload();
    }
    $scope.galleryImage = function(event){
        for(var i = 0;i<event.target.files.length;i++){
            var currentFile = event.target.files[i];
            var fileSize = currentFile.size/1024;
            if(fileSize > $scope.maxFileSize){
                alert(currentFile.name+' file size exceeded 200KB');
            }
            else{
                $scope.multiImages.push(event.target.files[i]);
                fileReader.readAsDataUrl(event.target.files[i], $scope).then(function(result) {
                    $scope.multiImagesSrc.push(result);
                });
            }
        }
    };
    $scope.saveReqImage = function(event,index){
        var currentFile = event.target.files[0];
        var fileSize = currentFile.size/1024;
        if(fileSize > $scope.maxFileSize){
            alert('Please upload max file size 200KB');
            return false;
        }
        $scope.reqImageArray[index] = event.target.files[0];
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
            angular.forEach(obj.AD_SLIDER,function(v,k){
                $scope.ad_sliders.push({ad_click:v.ad_click,ad_price:v.ad_price,ad_title:v.ad_title,workshop:v.workshop,ad_image:v.ad_image,adKey:k});
            });
            console.log($scope.ad_sliders);
            $scope.ad_sliders.push({ad_click:'',ad_price:'',ad_title:'',workshop:0,ad_image:'',adKey:$scope.ad_sliders.length});
            $scope.ad_home_screen_ads = obj.HOME_SCREEN_ADS.TOP_SCREEN;
        });
        var adCoursesObject = $scope.fDB.ref('APP_DATA').child('COURSES_DATA');
        $scope.adCourseList = $firebaseArray(adCoursesObject);
    };
    $scope.saveAdDeal = function(){
        $scope.isLoading = true;
        var WSObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_DEALS');
        var obj ={};
        obj.deal_1 = {image:$scope.ad_deals.deal_1.image,workshop:$scope.ad_deals.deal_1.workshop};
        obj.deal_2 = {image:$scope.ad_deals.deal_2.image,workshop:$scope.ad_deals.deal_2.workshop};
        obj.deal_3 = {image:$scope.ad_deals.deal_3.image,workshop:$scope.ad_deals.deal_3.workshop};
        obj.deal_4 = {image:$scope.ad_deals.deal_4.image,workshop:$scope.ad_deals.deal_4.workshop};
        WSObject.update(obj);
        $scope.showNoti(200,'Deal save successfully');
        $scope.isLoading = false;
    };
    $scope.adImageDeal1 = function(e){
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put(e.target.files[0]);
        $scope.mainLoader = true;
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $scope.ad_deals.deal_1.image = url;
                $scope.mainLoader = false;
            });
        });
    };
    $scope.adImageDeal2 = function(e){
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put(e.target.files[0]);
        $scope.mainLoader = true;
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $scope.ad_deals.deal_2.image = url;
                $scope.mainLoader = false;
            });
        });
    };
    $scope.adImageDeal3 = function(e){
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put(e.target.files[0]);
        $scope.mainLoader = true;
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $scope.ad_deals.deal_3.image = url;
                $scope.mainLoader = false;
            });
        });
    };
    $scope.adImageDeal4 = function(e){
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put(e.target.files[0]);
        $scope.mainLoader = true;
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $scope.ad_deals.deal_4.image = url;
                $scope.mainLoader = false;
            });
        });
    };
    $scope.adImageHomeTopScreen = function(e){
        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
        var f_storage = $firebaseStorage(f_storageRef);
        var uploadTask = f_storage.$put(e.target.files[0]);
        $scope.mainLoader = true;
        uploadTask.$complete(snapshot=>{
            var imagePath = $scope.fStorage.ref("availble_locations_image/"+e.target.files[0].name);
            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                $scope.ad_home_screen_ads.ad_image = url;
                $scope.mainLoader = false;
            });
        });
    };
    $scope.saveAdHomeTopScreen = function(){
        $scope.isLoading = true;
        var WSObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('HOME_SCREEN_ADS').child('TOP_SCREEN');
        var obj ={};
        obj.ad_click = $scope.ad_home_screen_ads.ad_click;
        obj.ad_image = $scope.ad_home_screen_ads.ad_image;
        obj.ad_price = $scope.ad_home_screen_ads.ad_price;
        obj.ad_title = $scope.ad_home_screen_ads.ad_title;
        obj.workshop = $scope.ad_home_screen_ads.workshop;
        WSObject.update(obj);
        $scope.showNoti(200,'Home screen ad save successfully');
        $scope.isLoading = false;
    };
    $scope.saveAdSlider = function(){
        $scope.isLoading = true;
        console.log($scope.adMediaFile);
        if($scope.adMediaFile.length > 0){
            for(var i = 0;i<$scope.adMediaFile.length;i++){
                if($scope.adMediaFile[i]){
                    (function(k){
                        var f_storageRef = $scope.fStorage.ref("availble_locations_image/"+$scope.adMediaFile[k].name);
                        var f_storage = $firebaseStorage(f_storageRef);
                        var uploadTask = f_storage.$put($scope.adMediaFile[k]);
                        uploadTask.$complete(snapshot=>{
                            var imagePath = $scope.fStorage.ref(snapshot.metadata.fullPath);
                            $firebaseStorage(imagePath).$getDownloadURL().then(function(url) {
                                if(typeof($scope.ad_sliders[k].adKey) == "string"){
                                    //var catDObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER').child($scope.ad_sliders[k].adKey);
                                    var adSliderObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER').child($scope.ad_sliders[k].adKey);
                                    var obj = {};
                                    obj.ad_image = url;
                                    obj.ad_click = $scope.ad_sliders[k].ad_click;
                                    obj.ad_title = $scope.ad_sliders[k].ad_title;
                                    obj.ad_price = $scope.ad_sliders[k].ad_price;
                                    obj.workshop = $scope.ad_sliders[k].workshop;
                                    adSliderObject.update(obj);
                                }
                                else{
                                    var catDObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER');
                                    $firebaseArray(catDObject).$add({
                                        ad_image : url,
                                        ad_click : $scope.ad_sliders[k].ad_click,
                                        ad_price : $scope.ad_sliders[k].ad_price,
                                        ad_title : $scope.ad_sliders[k].ad_title,
                                        workshop : $scope.ad_sliders[k].workshop,
                                    });
                                }
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
        else{
            for(var j = 0;j<$scope.ad_sliders.length;j++){
                var current = $scope.ad_sliders[j];
                if(current.ad_click != '' && current.ad_price != '' && current.ad_title != ''){
                    var adSliderObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER').child(current.adKey);
                    var obj = {};
                    obj.ad_click = current.ad_click;
                    obj.ad_title = current.ad_title;
                    obj.ad_price = current.ad_price;
                    obj.workshop = current.workshop;
                    adSliderObject.update(obj);
                    $scope.showNoti(200,'Ad Slider updated Successfully');
                    $scope.isLoading = false;
                }
            }   
        }
    };
    $scope.changeAdImage = function(event,index){
        var currentFile = event.target.files[0];
        var fileSize = currentFile.size/1024;
        if(fileSize > $scope.maxFileSize){
            alert('Please upload max file size 200KB');
            return false;
        }
        $scope.adMediaFile[index] = event.target.files[0];
    };
    $scope.addAdSlider = function(){
        $scope.ad_sliders.push({
            ad_click:'',
            ad_title:'',
            ad_price:'',
            workshop:'0',
            ad_image:'',
            adKey:$scope.ad_sliders.length+1
        });
    }
    $scope.removeAdSlider = function(index){
        var c = confirm("You want to remove this ad?");
        if(c){
            var adSliderObject = $scope.fDB.ref('APP_DATA').child('ADS_DATA').child('AD_SLIDER').child($scope.ad_sliders[index].adKey);
            var obj = $firebaseObject(adSliderObject);
            obj.$remove();
            $scope.ad_sliders.splice(index,1);
        }
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
        
    };
    /****** Coupons Functions ******/
    $scope.getCouponsList = function(){
        var couponbject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES');
        $scope.cpnList = $firebaseArray(couponbject);
        /*$scope.cpnList = [];
        $scope.cpnKeys = [];
        obj.$loaded().then(function() {
            // To iterate the key/value pairs of the object, use angular.forEach()
            console.log(obj);
            angular.forEach(obj, function(value, key) {
                $scope.cpnList.push(value);
               $scope.cpnKeys.push(key);
            });
        });*/
        //$scope.cpnList= cpnObj;
        //obj.$bindTo($scope, "cpnList");
    };
    $scope.editCoupon = function(key){
        console.log(key);
        var catDObject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES').child(key.$id);
        var obj = $firebaseArray(catDObject);
        obj.$loaded().then(function() {
            $scope.coupon_code = obj[0].$value;//.coupon_code;
            $scope.coupon_desc = obj[1].$value;//.coupon_desc;
            $scope.coupon_title = obj[2].$value;//.coupon_title;
            $scope.coupon_type = obj[3].$value;//.coupon_type;
            $scope.coupon_value = parseFloat(obj[4].$value);//.coupon_value;
            $scope.curCouponKey = key.$id;
        });
    }
    $scope.saveCoupon = function(){
        $scope.isLoading = true;
        if($scope.curCouponKey){
            var couponObject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES').child($scope.curCouponKey);
            var obj = {};
            obj.coupon_code = $scope.coupon_code;
            obj.coupon_desc = $scope.coupon_desc;
            obj.coupon_title = $scope.coupon_title;
            obj.coupon_type = $scope.coupon_type;
            obj.coupon_value = ''+$scope.coupon_value;
            couponObject.update(obj);
            $scope.showNoti(200,"Coupon Updated");
            $scope.curCouponKey = '';
            $scope.coupon_code = '';
            $scope.coupon_desc = '';
            $scope.coupon_title = '';
            $scope.coupon_type = '';
            $scope.coupon_value = '';
            $scope.isLoading = false;
        }
        else{
            var CouponObject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES');
            $firebaseArray(CouponObject).$add({
                'coupon_code': $scope.coupon_code,
                'coupon_desc': $scope.coupon_desc,
                'coupon_title': $scope.coupon_title,
                'coupon_type': $scope.coupon_type,
                'coupon_value': ''+$scope.coupon_value,
            });
            $scope.showNoti(200,'Coupon Added Successfully');
            $scope.coupon_code = '';
            $scope.coupon_desc = '';
            $scope.coupon_title = '';
            $scope.coupon_type = '';
            $scope.coupon_value = '';
            $scope.isLoading = false;
        }
    }
    $scope.deleteCoupon = function(key){
        var confirmThis = confirm("Do you want to delete this course?");
        if(confirmThis){
            $scope.showNoti(200,"Course Deleted");
            $scope.cpnList.$remove(key);
        }
        /*var couponObject = $scope.fDB.ref('APP_DATA').child('COUPON_CODES').child(key);
        var obj = $firebaseObject(couponObject);
        obj.$remove().then(function(ref) {
            $scope.showNoti(200,"Coupon Deleted");
        }, function(error) {
            console.log("Error:", error);
            $scope.showNoti(404,error);
        });*/
    }
    /****** Coupons Functions ******/
    $scope.getBookingList = function(){
        var bookingObject = $scope.fDB.ref('USER_DATA').child('USERS_BOOKINGS');
        var bOBj = bookingObject.orderByChild("booking_status").equalTo("cancelled").once("value", function(dataSnapshot){
            var series = dataSnapshot.val();
            
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
                        if(v.booking_status == 'cancelled'){
                            $scope.bknCList.push({
                                booking_course_name:v.booking_course_name,
                                booking_image:v.booking_image,
                                booking_course_location:v.booking_course_location,
                                booking_for:v.booking_for,
                                booking_rating:v.booking_rating,
                                booking_daydate:v.booking_daydate,
                                booking_time:v.booking_time,
                                course_fee:v.course_fee,
                                booking_status:v.booking_status,
                                uname:userData.full_name,
                                booking_type:v.booking_type
                            });
                        }
                        else if(v.booking_status == 'booked'){
                            $scope.bknBList.push({
                                booking_course_name:v.booking_course_name,
                                booking_image:v.booking_image,
                                booking_course_location:v.booking_course_location,
                                booking_for:v.booking_for,
                                booking_rating:v.booking_rating,
                                booking_daydate:v.booking_daydate,
                                booking_time:v.booking_time,
                                course_fee:v.course_fee,
                                booking_status:v.booking_status,
                                uname:userData.full_name,
                                booking_type:v.booking_type
                            });
                        }
                        else{
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
                                uname:userData.full_name,
                                booking_type:v.booking_type
                            });
                        }
                        $scope.bknKeys.push(key);
                        
                    });
                });
            });
            //$scope.bknList = bknObj;
        });
        
        //obj.$bindTo($scope, "bknList");
    };
    /****** Users List ******/
    $scope.getUsersList = function(){
        var userbject = $scope.fDB.ref('USER_DATA').child('USER_PROFILE');
        var obj = $firebaseObject(userbject);
        obj.$loaded().then(function(){
            angular.forEach(obj,function(v,k){
                $scope.userlist.push({name:v.full_name+' ('+v.user_email+', '+v.user_mobile+')',$id:k});
            });
        });
    }
    $scope.sendNotification = function(){
        $scope.isLoading = true;
        if($scope.noti_users.length < 1){
            alert('Please choose atleast 1 user to send notification');
            return false;
        }
        if($scope.noti_title == ''){
            alert('Please fill the notification title');
            return false;
        }
        if($scope.noti_message == ''){
            alert('Please fill the notification message');
            return false;
        }
        for(var i=0;i<$scope.noti_users.length;i++){
            var CatObject = $scope.fDB.ref('USER_DATA').child('USER_NOTIFICATIONS').child($scope.noti_users[i].$id);
            $firebaseArray(CatObject).$add({notiTitle:$scope.noti_title,notiMsg:$scope.noti_msg,notiImg:"https://docs.centroida.co/wp-content/uploads/2017/05/notification.png"});
            (function(k){
                var userTokenObject = $scope.fDB.ref('USER_DATA').child('USER_PROFILE').child($scope.noti_users[k].$id);
                var obj = $firebaseObject(userTokenObject);
                obj.$loaded().then(function(){
                    var device_token = obj.device_token;
                    var notiData = {
                        "to":device_token,
                        "data":{
                            "title":$scope.noti_title,
                            "message":$scope.noti_msg,
                            "image-url":"https://docs.centroida.co/wp-content/uploads/2017/05/notification.png"
                        }
                    };
                    var settings = {
                        "async": true,
                        "crossDomain": true,
                        "url": "https://fcm.googleapis.com/fcm/send",
                        "method": "POST",
                        "headers": {
                          "content-type": "application/json",
                          "authorization": "key=AAAAmIMOay0:APA91bGFXDg1QE2ib_pMLkn_fUXC95qcZMRrpn7s5Kj2DFvtY_d6adxYkhoEZHn36L0q88jKi3U7d2q2JC8Ft22lA9zgBrrBG5al5wB2rAljufGatpv0V_ijpSh6LWRjbIoHYg8qz5xp", //AIzaSyAAqFKs38JI3jPbmVfBKdEi040szQOEUvM
                          "cache-control": "no-cache"
                        },
                        "processData": false,
                        "data": JSON.stringify(notiData),//"{\n  \"to\":\n    \""+device_token+"\",\n  \"data\": {\n    \"title\": \""+$scope.noti_title+"\",\n    \"message\": \""+$scope.noti_message+"\",\n }\n}" //JSON.stringify(notiData)//
                      }
                      $.ajax(settings).done(function (response) {
                        if(k == ($scope.noti_users.length-1)){
                            $scope.showNoti(200,'Notifications sent Successfully');
                            $scope.isLoading = false;
                            $scope.noti_title = '';
                            $scope.noti_msg = '';
                            $scope.noti_users= {};
                        }
                      });
                });
            })(i);
        }
        
    };
    /****** Reviews List ******/
    $scope.getReviewList = function(){
        var reviewObject = $scope.fDB.ref('APP_DATA').child('REVIEW_DATA');
        var obj = $firebaseObject(reviewObject);
        var reviewList = {};
        obj.$loaded().then(function() {
            angular.forEach(obj, function(value, key) {
                var courseDataArray = $scope.fDB.ref('APP_DATA').child('COURSES_DATA').child(key);
                var courseDataObject = $firebaseObject(courseDataArray);
                (function(reviewKey){
                    courseDataObject.$loaded().then(function() {
                        if(typeof(reviewList[reviewKey]) == 'undefined'){
                            reviewList[reviewKey] = [];
                        }
                        reviewList[reviewKey].course_name = courseDataObject.course_name;
                        angular.forEach(value,function(v,k){
                            var userDataArray = $scope.fDB.ref('USER_DATA').child('USER_PROFILE').child(k);
                            var userData = $firebaseObject(userDataArray);
                            (function(reviewKey){
                                userData.$loaded().then(function() {
                                    if(typeof(reviewList[reviewKey].user_reviews) == 'undefined'){
                                        reviewList[reviewKey].user_reviews = [];
                                    }
                                    reviewList[reviewKey].user_reviews.push({
                                        user_name:userData.full_name,
                                        review_comment:v.review_comment,
                                        review_rating:v.review_rating
                                    });
                                });
                            })(reviewKey)
                        });
                    });
                })(key);
                
            });
        });
        $scope.reviewList = reviewList;
        //obj.$bindTo($scope, "reviewList");
    };
    /****** Route Changes ********/
    $scope.$on('$routeChangeStart',function(scope, next, current){
        $scope.mainLoader = true;
    });
    $scope.$on('$routeChangeSuccess',function(scope, next, current){
        //$scope.currentPage = next.$route.originalPath;
        $scope.mainLoader = false;
    });
}]);
enemaApp.directive('datePicker',function(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModelCtrl) {
            element.on('click',function(){
                var currentIndex = attrs.currentindex;
                jQuery('#datepicker-'+currentIndex).datepicker({
                    dateFormat: 'DD,d,MM,yy',
                    minDate:0,
                    onSelect: function (date) {
                        var exDate = date.split(',');
                        scope.courseTimeSlots[currentIndex].slot_date = exDate[1];
                        scope.courseTimeSlots[currentIndex].slot_day = exDate[0];
                        scope.courseTimeSlots[currentIndex].slot_month = exDate[2];
                        scope.courseTimeSlots[currentIndex].slot_year = exDate[3];
                        scope.$apply();
                    }
                });
                jQuery('#datepicker-'+currentIndex).datepicker('show');
            })
        }
    };
});
enemaApp.directive('autoComplete',function(){
    return{
        restrict:'A',
        link: function ($scope, element, attrs, ngModelCtrl) {
            var input = $(element).get(0);
            var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }
                $scope.$parent.course_location = place.name;
                $scope.$parent.course_lat = place.geometry.location.lat();
                $scope.$parent.course_longi = place.geometry.location.lng();
            });
        }
    };
});