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
