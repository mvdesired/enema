enemaApp.controller('enemaController',['$scope','$window','$location','$http','$localStorage','$timeout','$document','$interval','$sce','$firebaseAuth',
function($scope,$window,$location,$http,$localStorage,$timeout,$document,$interval,$sce,$firebaseAuth){
    $scope.lcl = $localStorage;
    $scope.fAuth = $firebaseAuth();
    $scope.loginEmail = '';
    $scope.loginPassword = '';
    /**Initializing Init Function*********/
    $scope.init = function(){
        if($scope.isUserLoggedIn()){
            
        }
        else{
            $location.path('/login');
        }
    }
    $scope.isUserLoggedIn = function(){
        if ($scope.fAuth.currentUser) {
            return true;
          }
    }
    $scope.login = function(){
        console.log($scope.loginEmail,$scope.loginPassword);
        $scope.fAuth.$signInWithEmailAndPassword($scope.loginEmail, $scope.loginPassword).then(function(result){
            console.log(result);
        }).catch(function(error) {
            console.log(error);
        });
    }
}]);