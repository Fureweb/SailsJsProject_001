####project01 (sails.js)

####웹 애플리케이션 개요
- sails.js / angular.js(ui-view) / mariadb 를 이용한 sails.js 튜토리얼 프로그램
- https://github.com/Fureweb/memoApp 프로젝트를 먼저 확인 후 참고하세요.
- 기존 localStorage를 이용한 로직 대신, 실제 데이터베이스를 사용하여 로직을 구현했습니다.
- 데이터베이스는

####간단 사용방법
node를 이용하여 server.js 실행 후 브라우저로 접속!

####사전 설치 필요 프로그램
node.js (4버전대의 LTS버전)
설치 후 npm install sails -g 명령어로 sails를 전역으로 설치합니다.

####애플리케이션 실행 방법
클론 후 app.js가 있는 곳에서 sails lift 명령어를 수행합니다.
(node app.js를 수행해도 무방)


####Database
- 프로젝트의 /config/connections.js 안에 본인이 가지고있는 MariaDB 커넥션 정보를 넣어주세요.
- 이후 아래의 DDL을 수행합니다.

-- memodb 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS `memodb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `memodb`;


-- memodb.memo 테이블 생성
CREATE TABLE IF NOT EXISTS `memo` (
  `memoId` int(11) NOT NULL AUTO_INCREMENT COMMENT '메모 고유번호',
  `content` text COMMENT '메모 내용',
  `cDate` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '최초 작성일',
  `mDate` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`memoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- memodb.memobackup 테이블 생성
CREATE TABLE IF NOT EXISTS `memobackup` (
  `memoId` int(11) NOT NULL DEFAULT '0' COMMENT '메모 고유번호',
  `content` text COMMENT '메모 내용',
  `cDate` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '최초 작성일',
  `mDate` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '삭제일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
