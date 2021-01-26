// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数 - 只用来获取用户openid - 朴实无华且枯燥...
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}