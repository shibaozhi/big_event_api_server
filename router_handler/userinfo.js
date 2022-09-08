// 导入数据库操作模块
const db =require('../db/index')

const bcrypt = require('bcryptjs')
exports.getUserInfo = (req,res)=>{
    // 根据用户的 id，查询用户的基本信息
    // 注意：为了防止用户的密码泄露，需要排除 password 字段
    const sql = `select id,username,nickname,email,user_pic from ev_users where id=?`
    // 注意：req 对象上的 user 属性，是 Token 解析成功，express-jwt 中间件帮我们挂载上去的
    db.query(sql,req.user.id,(err,results)=>{
        // 执行sql语句失败
        if(err) return res.cc(err)
        // 执行sql语句成功，但查询到的数据条数不等于1
        if(results.length !== 1) return res.cc('获取用户信息失败')
        // 将得到的数据返回客户端
        res.send({
            status:0,
            message:'获取用户信息成功',
            data:results[0]
        })

    })
}
exports.updateUserInfo = (req,res)=>{
    const sql = `update ev_users set ? where id=?`
    db.query(sql,[req.body,req.body.id],(err,results)=>{
        // 执行sql语句失败
        if(err) return res.cc(err)
        // 执行sql语句成功，但影响行数不为1
        if(results.affectedRows !== 1){
            return res.cc('修改用户信息失败')
        }
        return res.cc('修改用户信息成功',0)
    })
}
exports.updatePassword = (req,res)=>{
    const sql = `select * from ev_users where id=?`
    db.query(sql,req.user.id,(err,results)=>{
        if(err) return res.cc(err)
        if(results.length !==1) return res.cc('用户不存在')

        // 判断提交的旧密码是否正确
        const compareResult = bcrypt.compareSync(req.body.oldPwd,results[0].password)
        if(!compareResult) return res.cc('原密码错误')
        // 对新密码进行加密后更新到数据库中
        const newPwd = bcrypt.hashSync(req.body.newPwd,10)
        const sql = `update ev_users set password=? where id=?`
        db.query(sql,[newPwd,req.user.id],(err,results)=>{
            if(err) return res.cc(err)
            if(results.affectedRows !== 1){
                return res.cc('更新密码失败')
            }
            res.cc('更新密码成功',0)
        })
    })
}
// 更新头像的处理函数
exports.updateAvatar = (req,res)=>{
    const sql = `update ev_users set user_pic=? where id=?`
    db.query(sql,[req.body.avatar,req.user.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows !== 1){
            return res.cc('更新头像失败')
        }
        return res.cc('更新头像成功',0)
    })
}