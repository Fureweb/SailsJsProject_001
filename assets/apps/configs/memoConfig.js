angular.module('memoApp').config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/list');

  $stateProvider
    .state('list', {
      url: '/list',
      templateUrl: '/templates/list.html'
    })
    .state('write', {
      url: '/write',
      templateUrl: '/templates/write.html'
    })
    .state('view', {
      url: '/view/{memoId}',
      templateUrl: '/templates/view.html'
    })
    .state('modify', {
      url: '/modify/{memoId}',
      templateUrl: '/templates/modify.html'
    });
});
