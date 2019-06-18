# stf<br>
stf的自定义；添加用户管理，添加用户设备分配及限制；<br>
<br>
lib/units/auth/mock.js 登陆验证<br>
lib/units/websocket/index.js 用户设备限制<br>
lib/units/api/controllers/devices.js 用户设备限制<br>
lib/units/device/plugins/screen/stream.js 设备传输流大小控制<br>
<br>
####https://npm.taobao.org/mirrors/node/v8.16.0/<br>
<br>
CREATE TABLE `t_stf_user` (<br>
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主健;',<br>
  `username` varchar(20) NOT NULL COMMENT '用户账户',<br>
  `email` varchar(50) NOT NULL COMMENT '用户邮箱',<br>
  `type` tinyint(4) DEFAULT '0' COMMENT '用户类型,0非设备管理员,1指定设备管理员;2设备超级管理员',<br>
  PRIMARY KEY (`id`),<br>
  UNIQUE KEY `username` (`username`)<br>
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;<br>
<br>
<br>
CREATE TABLE `t_stf_user_devices` (<br>
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主健;',<br>
  `username` varchar(20) NOT NULL COMMENT '用户账户',<br>
  `serial` varchar(50) NOT NULL COMMENT '手机设备串号',<br>
  PRIMARY KEY (`id`),<br>
  UNIQUE KEY `serial` (`serial`)<br>
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;<br>
<br>
<br>
