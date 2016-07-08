/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /': 'MemoController.init', //초기 요청 페이지 - sails.js에서 처리한다.
  'get /api/memolist': 'MemoController.getMemoList', // 전체 memo 리스트 얻기
  'get /api/memo/:memoId': 'MemoController.getMemoByMemoId', //memoId로 메모 얻기
  'post /api/memo/writeMemo': 'MemoController.writeMemoProcess', //새 메모쓰기 프로세스
  'delete /api/memo/:memoId': 'MemoController.deleteMemoProcess', //메모 삭제 프로세스
  'post /api/memo/modifyMemo/:memoId': 'MemoController.modifyMemoProcess', //메모 수정 프로세스
  //state 전환(html snippets들을 교체하려하는 경우)은 ui-router의 ui-view를 이용하여 처리한다.

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
