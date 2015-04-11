var myApp = angular.module('myApp', ['ngDialog','myApp.services','ngCookies'/*,'myApp.directives'*/]).config(function($routeProvider,$locationProvider,$httpProvider){ 
	
  
    var checkLoggedin = function($q, $timeout, $http, $location,$rootScope,$cookieStore,canvasData){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){

        // Authenticated
        if (user !== '0' && typeof(user) !== 'undefined'){

          $timeout(deferred.resolve, 0);
          
          $rootScope.useronline = user;

        }
        // Not Authenticated
        else {
          $cookieStore.remove('login');
          $rootScope.useronline = undefined;
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/login');
        }
      });


      return deferred.promise;
    };   
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          }, 
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401)
              $location.url('/login');
            return $q.reject(response);
          }
        );
      }
    });

  $routeProvider.when('/', {
      templateUrl: 'partials/main',
      controller: MainCtrl ,
  })
  .when('/index', {
  		templateUrl: 'partials/index',
  		controller: IndexCtrl ,
      resolve: { loggedin: checkLoggedin } 
	}).
	when('/Login', {
	    templateUrl: 'partials/login',
      controller: LoginCtrl
	}).
  when('/signup', {
      templateUrl: 'partials/signup',
      controller: SignupCtrl
  }).
  when('/profile', {
      templateUrl: 'partials/profile',
      controller : ProfileCtrl,
      resolve: { loggedin: checkLoggedin } 
  }).
    otherwise({
      redirectTo: '/'
      });
  }) 

/// LOG OUT FUNCTIONALITY
  .run(function($rootScope, $http){

    // Logout function is available in any pages
      $rootScope.logout = function(){

      console.log("Log out user:",$rootScope.useronline); 
      io.broadcast.emit('user:left', {
        name: $rootScope.useronline
      });

      $rootScope.useronline = undefined;
      canvasData.setProperty("First");


      $http.post('/logout');
    };

}); 
