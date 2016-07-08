angular.module('memoApp').controller('memoModifyController', function($stateParams, $scope, $state, storage ){

    storage.getMemo( $stateParams.memoId ).then(function(data){
        $scope.content = data[0].content;
        $scope.memoId = $stateParams.memoId;
    })

    $scope.modifyProcess = function( memoId, content ){
        storage.modifyMemo( memoId, content ).then(function(data){
            if(!data) alert('수정에 실패했습니다.');
            $state.go('list');
        })
    };
});
