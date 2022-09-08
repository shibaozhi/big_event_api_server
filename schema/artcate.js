// 导入定义规则的模块
const joi = require('joi')

// 定义分类名称和分类别名的校验规则
const name = joi.string().required()
const alias = joi.string().alphanum().required()
// 定义 分类id的校验规则
const id = joi.number().integer().min(1).required()
// 校验规则对象 - 添加分类
exports.add_cate_schema = {
    body:{
        name,
        alias
    }
}
exports.delete_cate_schema = {
    params:{
        id
    }
}
exports.get_cate_schema = {
    params:{
        id
    }
}
// 校验规则对象 - 更新分类
exports.update_cate_schema = {
    body:{
        id,
        name,
        alias
    }
}