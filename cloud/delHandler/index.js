// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let c_name = event.collection; // 1- 数据库名
  db = cloud.database().collection(c_name); // 2- 获取db对象

  switch (c_name) {
    case "category": {
      return CateDelHandler(event)
    }
  }
}

async function CateDelHandler(event) {
  return db.where({
    _id: event._id
  }).remove();
}