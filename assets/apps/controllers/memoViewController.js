angular.module('memoApp').controller('memoViewController', function($stateParams, $scope, storage){

    storage.getMemo($stateParams.memoId).then(function(data){
        $scope.content = data[0].content;
    });
    
});
