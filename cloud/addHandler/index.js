// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = null;

/**
 * 思路:
 * 首先查询数据库中有无该条重复记录
 *  有的话, 就提示重复, return false
 *  没有的话, 就添加, done
 */
exports.main = async (event, context) => {
	let c_name = event.collection; // 1- 数据库名
	db = cloud.database().collection(c_name); // 2- 获取db对象

	switch (c_name) {
		case "category": {
			return CateAddHandler(event)
		}
		case "comment": {
			return commentAddHandler(event)
		}
		case "checkContent": {
			return contentCheck(event)
		}
	}
}

// 分类获取
async function CateAddHandler(event) {
	return db.where({
		name: event.formData.name
	}).get()
}

// 文章评论
async function commentAddHandler(event) {
	return db.add({
		data: event.comment
	})
}

// 敏感内容审核
async function contentCheck(event) {
	try {
		let res = await cloud.openapi.security.msgSecCheck({
			content: event.content
		})
		return res
	} catch (error) {
		return error
	}
}