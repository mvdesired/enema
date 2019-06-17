enemaApp.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider) {
    $routeProvider.
      when("/", {
        templateUrl : "views/dashbaord.html"
      }).
      when('/login', {
         templateUrl: 'views/login.html',
      }).
      when('/cities', {
        templateUrl: 'views/city-list.html'
      }).
      when('/city-add', {
        templateUrl: 'views/city-add.html'
      }).
      when('/city-edit/:key', {
        templateUrl: 'views/city-edit.html'
      }).
      when('/categories', {
        templateUrl: 'views/categories.html'
      }).
      when('/workshop', {
        templateUrl: 'views/workshop.html'
      }).
      when('/bookings', {
        templateUrl: 'views/bookings.html'
      }).
      when('/ad', {
         templateUrl: 'views/ad-list.html'
      }).
      when('/settings',{
        templateUrl: 'views/settings.html'
      }).
      when('/coupons',{
        templateUrl: 'views/coupons.html'
      }).
      when('/notifications',{
        templateUrl: 'views/notifications.html'
      }).
      when('/reviews',{
        templateUrl: 'views/reviews.html'
      });
      // when('/reset-password', {
      //   templateUrl: 'reset-password.html'
      // }).
      // when('/email-confirmed/:emailToken', {
      //   templateUrl: 'screen-03-01.html'
      // }).
      // when('/profile-confirm', {
      //   templateUrl: 'screen-02.html'
      // }).
      // when('/profile', {
      //   templateUrl: 'screen-04.html'
      // }).
      // when('/location-preload', {
      //    templateUrl: 'screen-05-02.html'
      // }).
      // when('/location-chat/:locationId', {
      //   templateUrl: 'screen-05.html',
      // }).
      // when('/location-chat-start/:locationChatId', {
      //   templateUrl: 'screen-06.html',
      // }).
      // when('/private-chat/:privateChatId', {
      //   templateUrl: 'screen-05-01.html',
      // }).
      // when('/private-chat-list', {
      //   templateUrl: 'screen-09.html',
      // }).
      // when('/radius-changer', {
      //   templateUrl: 'screen-07.html',
      // }).
      /* otherwise({
         templateUrl: 'views/dashbaord.html',
         //redirectTo: '/'
       });*/
  }])
