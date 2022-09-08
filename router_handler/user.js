// 这里定义和用户相关的路由处理函数，供router/user.js使用
const db = require('../db/index')
// 加密密码
const bcrypt = require('bcryptjs')
// 生成JWT的Token字符串
const jwt = require('jsonwebtoken')
// 注册用户的处理函数
exports.regUser = (req,res)=>{
    const userinfo = req.body
    if(!userinfo.username || !userinfo.password){
        // return res.send({status:1,message:'用户名或密码不能为空'})
        return res.cc('用户名或密码不能为空')
    }

    // 定义sql语句查询用户名是否存在
    const sql = `select * from ev_users where username=?`
    db.query(sql,userinfo.username,(err,results)=>{
        if(err){
            // return res.send({status:1,message:err.message})
            return res.cc(err)
        }

        if(results.length>0){
            // 注意：连续调用两个res.send()会报错！！！
            // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！'})
            return res.cc('用户名被占用，请更换其他用户名！')
        }
        // 用户名可用，继续流程
        // 对用户的密码进行加密处理,10可以提高安全性
        userinfo.password = bcrypt.hashSync(userinfo.password,10)
        // 插入新用户
        const sql = 'insert into ev_users set ?'
        db.query(sql,{username:userinfo.username,password:userinfo.password},(err,results)=>{
            // 执行sql语句失败
            // if(err) return res.send({status:1,message:err.message})
            if(err) return res.cc(err)
            // sql语句执行成功
            if(results.affectedRows !== 1){
                // return res.send({status:1,message:'注册用户失败，请稍后再试'})
                return res.cc('注册用户失败，请稍后再试')
            }
            // res.send({status:0,message:'注册成功！'})
            res.cc('注册成功',0)
        })
    })
}
// 登录的处理函数
exports.login = (req,res)=>{
    const userinfo = req.body
    const sql =`select * from ev_users where username=?`
    // 查询用户数据
    db.query(sql,userinfo.username,(err,results)=>{
        // 执行sql语句失败
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('登录失败')
        // 判断用户密码是否输入正确
        //核心实现思路：调用 bcrypt.compareSync(用户提交的密码, 数据库中的密码) 方法比较密码是否一致
        // 返回值是布尔值（true 一致、false 不一致）
        const compareResult = bcrypt.compareSync(userinfo.password,results[0].password)
        if(!compareResult){
            return res.cc('登录失败')
        }
        
        // 登录成功，生成Token字符串
        // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
        const user = {...results[0],password:'',user_pic:''}
        // 导入配置文件
        const config = require('../config')
        // 生成Token字符串
        const tokenStr = jwt.sign(user,config.jwtSecretKey,{expiresIn:'10h'}) //token的有效期是10个小时
        res.send({
            status:0,
            message:'登录成功',
            // 为了方便客户端使用Token，在服务器直接拼接上Bearer的前缀
            token:'Bearer ' + tokenStr
        })

    })
    
}
