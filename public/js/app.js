'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/viewSignUp', {templateUrl: 'partial/SignUp', controller: MyCtrl1});
    $routeProvider.when('/view2', {templateUrl: 'partial/2', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/viewSignUp'});
    $locationProvider.html5Mode(true);
  }]);
