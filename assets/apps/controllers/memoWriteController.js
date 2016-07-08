angular.module('memoApp').controller('memoWriteController', function($stateParams, $scope, $state, storage ){

    $scope.write = function(content){
        if(!content){
            alert('본문을 입력해주세요.');
            $("textarea").focus();
            return;
        };

        storage.writeMemo(content).then(function(data){
            if(!data) alert('글쓰기에 실패했습니다.');
            $state.go('list');
        });
    };
});
