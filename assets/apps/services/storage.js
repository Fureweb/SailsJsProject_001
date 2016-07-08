angular.module('memoApp').factory("storage",function($http) {
  return {
    getMemoId : function(memoId) {
        console.log('getMemoId()');
        return $http.get('/api/memo/'+memoId).then(
            function(response){
                return response.data;
            }
        );
    },
    getMemoList : function() {
        console.log('getMemoList()');
        return $http.get('/api/memolist').then(
            function( response ) { return response.data; }
        );
    },
    getMemo : function(memoId) {
        console.log('getMemo()');
        return $http.get('/api/memo/'+memoId).then(
            function( response ) { return response.data; }
        );
    },
    writeMemo : function(content) {
        console.log('writeMemo()');
        var data = {content: content};
        return $http.post('/api/memo/writeMemo', data).then(
            function() { return true; },
            function() { return false; }
        );
    },
    modifyMemo : function(memoId, content) {
        console.log('modifyMemo()');
        return $http.post('/api/memo/modifyMemo/'+memoId, {content: content}).then(
            function() { return true; },
            function() { return false; }
        );
    },
    deleteMemo : function(memoId) {
        console.log('deleteMemo()');
        return $http.delete('/api/memo/'+memoId).then(
            function() { return true; },
            function() { return false; }
        );
    }
  }
});
