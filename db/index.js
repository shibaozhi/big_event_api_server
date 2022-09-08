// 1、导入mysql模块
const mysql = require('mysql')
// 2、建立与Mysql数据库的连接
const db = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'123456',
    database:'my_db_01'
})

// 向外共享db数据库连接对象
module.exports = db