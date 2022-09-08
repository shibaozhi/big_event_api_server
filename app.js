// 导入模块
const express = require('express')
const joi = require('joi')
// 创建express服务器实例
const app = express()

// 配置cros跨域
const cors = require('cors')
app.use(cors())

// 配置解析表单数据的中间件
app.use(express.urlencoded({extended:false}))
// 响应数据的中间件
app.use((req,res,next)=>{
    // status=1为失败
    res.cc = (err,status=1)=>{
        res.send({
            status,
            // 判断err是错误对象，还是字符串
            message:err instanceof Error ? err.message : err,
        })
    }
    next()
})

// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))

// 解析Token的中间件
const config = require('./config')
const expressJWT = require('express-jwt')
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api\//]}))


// 导入注册用户路由模块
const userRouter = require('./router/user')
app.use('/api',userRouter)
// 导入并使用个人中心的路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my',userinfoRouter)
// 导入并使用文章分类的模块
const artCateRouter = require('./router/artcate')
app.use('/my/article',artCateRouter)

// 导入并使用文章路由模块
const articleRouter = require('./router/article')
app.use('my/article',articleRouter)

// 错误中间件
app.use((err,req,res,next)=>{
    // 数据验证失败
    if(err instanceof joi.ValidationError) return res.cc(err)
    if(err.name === 'UnauthorizedError') return res.cc('身份验证失败')
    // 未知错误
    res.cc(err)
})

// 启动web服务器
app.listen(3007,()=>{
    console.log('api server running at http://127.0.0.1:3007')
})