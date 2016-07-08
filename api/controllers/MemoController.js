'use strict';

const _ = require('lodash');
const MariaDb = require('../services/MariaDb.js')

//런타임 중에 database 설정에 접속하려면 sails.config property를 이용해 사용할 수 있다.
module.exports = {
    init( req, res ) {
        res.view('index', this.getMemoList( req, res ));
    },
    getMemoList( req, res ) {
        console.log('getMemoList()');
        MariaDb(function*( conn ) {
            const list = yield conn.query(`SELECT * FROM memo ORDER BY memoId DESC`);
            return list;
        }).then(r=>res.send(r), e=>res.serverError(e)); //then의 첫번째 인자는 성공했을 때, 두번째 인자는 실패했을 때.
    },
    getMemoByMemoId( req, res ) {
        console.log('getMemoByMemoId()');
        const memoId = req.param('memoId');
        MariaDb(function*( conn ) {
            const memo = yield conn.query(`SELECT * FROM memo WHERE memoId = :memoId`, {memoId});
            return memo;
        }).then(r=>res.send(r), e=>res.serverError(e));
    },
    writeMemoProcess( req, res ) {
        console.log('writeMemoProcess()');
        const content = req.body.content;
        MariaDb(function*( conn ) {
            yield conn.query(`INSERT INTO memo(content) VALUES(:content)`, {content});
        }).then(r=>res.send(r), e=>res.serverError(e));
    },
    deleteMemoProcess( req, res ) {
        console.log('deleteMemoProcess()');
        const memoId = req.param('memoId');
        MariaDb(function*( conn ) {
            yield conn.query(`INSERT INTO memobackup(memoId, content, cDate, mDate) SELECT memoId, content, cDate, now() as mDate FROM memo WHERE memoId = :memoId`, {memoId});
            yield conn.query(`DELETE FROM memo WHERE memoId = :memoId`, {memoId});
        }).then(r=>res.send(r), e=>res.serverError(e));
    },
    modifyMemoProcess( req, res ) {
        console.log('modifyMemoProcess()');
        const memoId = req.param('memoId');
        const content = req.body.content;
        MariaDb(function*( conn ) {
            yield conn.query(`UPDATE memo SET content = :content WHERE memoId = :memoId`, {content, memoId});
        }).then(r=>res.send(r), e=>res.serverError(e));
    }

};
