enemaApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when("/", {
        templateUrl : "dashbaord.html"
      }).
      when('/login', {
         templateUrl: 'views/index.html',
      }).
      when('/dashbaord', {
        templateUrl: 'views/dashbaord.html'
      })
      // when('/sign-up', {
      //   templateUrl: 'screen-03.html'
      // }).
      // when('/forgot-password', {
      //   templateUrl: 'forgot-password.html'
      // }).
      // when('/forgot-password-token-check', {
      //   templateUrl: 'forgot-password-token-check.html'
      // }).
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
       //otherwise({
         //templateUrl: 'index.html',
      //   //redirectTo: '/'
      // });
  }])
