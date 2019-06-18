# stf
stf的自定义；添加用户管理，添加用户设备分配及限制；

lib/units/auth/mock.js 登陆验证
lib/units/websocket/index.js 用户设备限制
lib/units/api/controllers/devices.js 用户设备限制
lib/units/device/plugins/screen/stream.js 设备传输流大小控制

####https://npm.taobao.org/mirrors/node/v8.16.0/

CREATE TABLE `t_stf_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主健;',
  `username` varchar(20) NOT NULL COMMENT '用户账户',
  `email` varchar(50) NOT NULL COMMENT '用户邮箱',
  `type` tinyint(4) DEFAULT '0' COMMENT '用户类型,0非设备管理员,1指定设备管理员;2设备超级管理员',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `t_stf_user_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主健;',
  `username` varchar(20) NOT NULL COMMENT '用户账户',
  `serial` varchar(50) NOT NULL COMMENT '手机设备串号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial` (`serial`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

