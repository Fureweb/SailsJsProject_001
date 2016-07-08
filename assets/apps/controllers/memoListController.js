angular.module('memoApp').controller('memoListController', function($scope, $state, storage){

    function getMemoList(){
        storage.getMemoList().then(function( data ) {
            $scope.contents = data;
        })
    }

    getMemoList();

    $scope.deleteMemo = function(memoInfo){
        if(confirm('삭제 시 복구할 수 없습니다. 계속하시겠습니까?')) {
            storage.deleteMemo( memoInfo.memoId ).then(function(data){
                if( !data ) alert('삭제에 실패했습니다.');
                else getMemoList();
            });
        }
    };
});
