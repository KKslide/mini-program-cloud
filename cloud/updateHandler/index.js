// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
let db = null

// 云函数入口函数
exports.main = async (event, context) => {
    let c_name = event.collection; // 1- 数据库名
    db = cloud.database().collection(c_name); // 2- 获取db对象

    switch (c_name) {
        case "view_num":
            return viewNumAdd(event)
        case "category_sort":
            return categorySort(event) // 文章分类排序
    }
}

// 访问量++
async function viewNumAdd(event) {
    db = cloud.database().collection("content");
    return db.where({
        _id: event._id
    }).update({
        data: {
            viewnum: event.viewnum
        }
    })
}

// 文章分类排序
async function categorySort(event) {
    db = cloud.database().collection("category");
    let sortedData = event.sortedData; // 传入的排序数据
    let proArr = [];
    for (i in sortedData) {
        proArr.push(
            db.where({
                _id: sortedData[i]._id
            }).update({
                data: {
                    index: sortedData[i]["index"]
                }
            })
        )
    }
    return Promise.all(proArr)

}