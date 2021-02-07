// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = null

let _ = cloud.database().command
let $ = _.aggregate; // 聚合操作符

// 云函数入口函数
exports.main = async (event, context) => {
	let c_name = event.collection; // 1- 数据库名
	db = cloud.database().collection(c_name); // 2- 获取db对象

	switch (c_name) {
		case "category": {
			return CateGetHandler(event)
		}
		case "content": {
			return ContentGetHandler(event)
		}
		case "singleContent": {
			return GetSingleContent(event)
		}
		case "content_search": {
			return ContentSearch(event)
		}
		case "message": {
			return MessageGetHandler(event)
		}
		case "getUnRead": {
			return getUnRead(event)
		}
		case "getUnreadCommentArticle": {
			return getUnreadCommentArticle(event)
		}
		case "getUnreadMsg": {
			return getUnreadMsg(event)
		}
	}
}

// 获取未读消息数量
async function getUnRead(event) {
	db = cloud.database()
	let msg_unread_count, comment_unread_count;
	return await db.collection("message")
		.where({
			auth_is_read: 0
		})
		.get()
		.then(unreadMsgRes => {
			console.log(unreadMsgRes);
			msg_unread_count = unreadMsgRes.data.length
			return msg_unread_count
		})
		.then(_ => {
			let unreadCommentRes = db.collection("comment")
				.where({
					auth_is_read: 0
				})
				.get()
			return unreadCommentRes
		})
		.then(unreadCommentRes => {
			comment_unread_count = unreadCommentRes.data.length;
			return {
				"msg_unread_count": msg_unread_count,
				"comment_unread_count": comment_unread_count
			}
		})
}

async function getUnRead2(event) {
	db = cloud.database()
	return db.collection("message")
		.aggregate()
		.match(_.expr($.eq(["$auth_is_read", 0])))
		.count("msg_unread_count")
		.lookup({
			from: "comment",
			pipeline: $.pipeline()
				.match(_.expr($.eq(["$auth_is_read", 0])))
				.count("comment_unread_count")
				.done(),
			as: "comment_unread_count"
		})
		.project({
			msg_unread_count: 1, // 留言未读数量
			comment_unread_count: $.arrayElemAt(['$comment_unread_count.comment_unread_count', 0]) // 文章评论未读数量
		})
		.end()
}

// 分类集合获取
async function CateGetHandler(event) {
	return db.where({
			name: "HOT"
		})
		.get()
		.then(res => {
			/**
			 * 如果是空集合或者集合中没有"HOT"分类
			 * 则添加该分类
			 * 主要是刚开始部署的时候,设计了这么个分类,具体的热榜算法还未设计
			 */
			if (res.data.length != 0) { // (1)- 若是已经有了HOT分类-直接查询
				return db.orderBy('index', 'asc').get()
			} else { // (2)- 若是没有HOT分类-动态添加
				return cloud.callFunction({
						name: "addHandler",
						data: {
							collection: "category",
							name: "HOT",
							banner: event.banner || "http://example.kkslide.fun/banner.jpg",
							addtime: event.addtime || new Date(),
							edittime: event.edittime || new Date(),
							list_type: '0', // 分类展示类型
							index: event.index || 0
						}
					})
					.then(addRes => {
						console.log(addRes);
						return db.orderBy('index', 'asc').get()
					})
			}
		})
}

// 内容集合获取
async function ContentGetHandler(event) {
	const _ = cloud.database().command;
	if (event.content_type && event.content_type == "mini_program") { // 小程序端
		db = cloud.database().collection("content")
		if (event.category_id == "HOT") { // 单独HOT分类的查询
			return db.aggregate()
				.match({
					isHot: "1",
					isShow: "1"
				})
				.lookup({ // 关联分类表
					from: 'category',
					localField: 'category',
					foreignField: '_id',
					as: 'category',
				})
				.lookup({ // 关联评论列表
					from: 'comment',
					let: {
						content_collection_id: '$_id' // content集合的_id字段
					},
					pipeline: $.pipeline() // 需要对评论时间做排序处理
						.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
						.sort({
							com_time: -1
						})
						.done(),
					as: 'comment',
				})
				.sort({ // 按照编辑时间排序
					edittime: -1
				})
				.end()
		} else { // 除HOT分类之外的查询
			return db.aggregate()
				.match({
					category: event.category_id,
					isShow: "1"
				})
				.lookup({ // 关联分类表
					from: 'category',
					localField: 'category',
					foreignField: '_id',
					as: 'category',
				})
				.lookup({ // 关联评论列表
					from: 'comment',
					let: {
						content_collection_id: '$_id' // content集合的_id字段
					},
					pipeline: $.pipeline() // 需要对评论时间做排序处理
						.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
						.sort({
							com_time: -1
						})
						.done(),
					as: 'comment',
				})
				.sort({ // 按照编辑时间排序
					edittime: -1
				})
				.end()
		}
	}
	// 后台管理页(调试)
	let searchObj = {}
	if (event.title != "") {
		searchObj.title = _.in([cloud.database().RegExp({
			regexp: event.title,
			options: 'i'
		})])
	}
	if (event.category != "") {
		searchObj.category = _.in([event.category])
	}
	if (event.rangeTime.length != 0) {
		searchObj.addtime = _.and([{
				addtime: _.gte(parseInt(event.rangeTime[0]))
			},
			{
				addtime: _.lte(parseInt(event.rangeTime[1]))
			}
		])
	}

	let total, response;
	return db.where(searchObj).count()
		.then(res => {
			console.log("总数查询: ", res);
			total = res;
			return total
		})
		.then(total => {
			response = db.aggregate()
				.match(searchObj)
				.lookup({ // 关联分类表
					from: 'category',
					localField: 'category',
					foreignField: '_id',
					as: 'category',
				})
				.lookup({ // 关联评论列表
					from: 'comment',
					let: {
						content_collection_id: '$_id' // content集合的_id字段
					},
					pipeline: $.pipeline() // 需要对评论时间做排序处理
						.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
						.sort({
							com_time: -1
						})
						.done(),
					as: 'comment',
				})
				.sort({ // 按照时间排序
					addtime: -1
				})
				.skip((event.pageNo - 1) * event.pageSize).limit(event.pageSize) // 分页
				.end()
			return response
		})
		.then(dataList => {
			let _FinalResponse = Object.assign(dataList, total);
			_FinalResponse["errMsg"] = "ok";
			return _FinalResponse;
		})
		.catch(err => {
			return err
		})
}

// 含有未读消息的文章列表
async function getUnreadCommentArticle(event) {
	const db = cloud.database();
	const _ = cloud.database().command;
	let total = 0;
	return db.collection("comment")
		.aggregate()
		.match({ // 过滤未读消息
			auth_is_read: 0
		})
		.project({ // 整理所需content_id字段
			_id: 1,
			content_id: 1
		})
		.group({ // 去重文章id
			_id: '$content_id'
		})
		.count("total")
		.end()
		.then(res => {
			res.list.length;
			if (res.list.length == 0) {
				return total
			} else {
				total = res.list[0].total
				return total
			}
		})
		.then(total => {
			if (total == 0) {
				return {
					total: total
				}
			} else {
				let contentSearch = db.collection("comment")
					.aggregate()
					.match({ // 过滤未读消息
						auth_is_read: 0
					})
					.project({ // 整理所需content_id字段
						_id: 1,
						content_id: 1
					})
					.group({ // 去重文章id
						_id: '$content_id'
					})
					.project({ // 整理所需content_id字段
						_id: 0,
						content_id: '$_id'
					})
					.lookup({ // 关联内容表
						from: 'content',
						// localField: 'content_id',
						// foreignField: '_id',
						let: {
							content_id: '$content_id'
						},
						pipeline: $.pipeline()
							.match(_.expr($.eq(['$_id', '$$content_id'])))
							.sort({
								addtime: -1
							})
							.done(),
						as: 'content',
					})
					.project({
						content: $.arrayElemAt(['$content', 0])
					})
					// 第一阶段获得未读消息所属的文章id,形成列表
					// sql的话就是:
					/**
					 * select content_id from comment where auth_is_read=0 group by content_id
					 * 比较恶心的一点就是: 不知道怎么在mongodb这种非关系性数据库中去写 in 这种sql语句, 所以就写得很长
					 * 接下来的sql逻辑大概是这样
					 * select * from content c1 
					 * left join category c2 on c1.category = c2.content_id 
					 * left join comment c3 on c1._id = c3.content_id
					 * where c1._id in 
					 * (select content_id from comment where auth_is_read=0 group by content_id)
					 */
					.lookup({ // 关联分类表
						from: 'category',
						localField: 'content.category',
						foreignField: '_id',
						as: 'content.category',
					})
					.lookup({ // 关联评论列表
						from: 'comment',
						let: {
							content_collection_id: '$content._id' // content集合的_id字段
						},
						pipeline: $.pipeline() // 需要对评论时间做排序处理
							.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
							.sort({
								com_time: -1
							})
							.done(),
						as: 'content.comment',
					})
					.skip((event.pageNo - 1) * event.pageSize).limit(event.pageSize) // 分页
					.end()
				return contentSearch
			}
		})
		.then(contentSearch => {
			if (total == 0) {
				return {
					total: total,
					data: []
				}
			} else {
				return {
					total: total,
					data: contentSearch.list.map(v => {
						return v["content"]
					})
				}
			}
		})
	// ******************************
}

// 留言集合获取
async function MessageGetHandler(event) {
	const _ = cloud.database().command;
	if (event.content_type && event.content_type == "mini_program") {
		db = cloud.database().collection("content")
		return db.aggregate()
			.match({
				category: event.category_id
			})
			.lookup({ // 关联分类表
				from: 'category',
				localField: 'category',
				foreignField: '_id',
				as: 'category',
			})
			.lookup({ // 关联评论列表
				from: 'comment',
				let: {
					content_collection_id: '$_id' // content集合的_id字段
				},
				pipeline: $.pipeline() // 需要对评论时间做排序处理
					.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
					.sort({
						com_time: -1
					})
					.done(),
				as: 'comment',
			})
			.end()
	}
	// 留言获取-管理页,包括搜索以及分页
	let searchObj = {},
		total;
	if (event.message != "") { // 留言内容
		searchObj.message = _.in([cloud.database().RegExp({
			regexp: event.message,
			options: 'i'
		})])
	}
	if (event.guest_name != "") { // 用户昵称
		searchObj.guest_name = _.in([cloud.database().RegExp({
			regexp: event.guest_name,
			options: 'i'
		})])
	}
	if (String(event.auth_is_read) != "") { // 是否已读
		searchObj.auth_is_read = _.in([Number(event.auth_is_read)])
	}
	if (event.rangeTime.length != 0) { // 时间范围
		searchObj.addtime = _.and([{
				addtime: _.gte(parseInt(event.rangeTime[0]))
			},
			{
				addtime: _.lte(parseInt(event.rangeTime[1]))
			}
		])
	}
	return db.where(searchObj).count()
		.then(res => {
			total = res.total
			if (total == 0) {
				return {
					total: total,
					data: []
				}
			} else {
				// return total
				return res
			}
		})
		.then(total => {
			let searchRes = db.aggregate()
				.match(searchObj)
				.sort({ // 按照时间排序
					addtime: -1
				})
				.skip((event.pageNo - 1) * event.pageSize).limit(event.pageSize) // 分页
				.end()
			return searchRes
		})
		.then(searchRes => {
			return {
				total: total,
				data: searchRes.list
			}
		})
}

// 获取未读状态的留言-(后台管理页)
async function getUnreadMsg(event) {
	const db = cloud.database()
	let total = 0;
	return db.collection("message")
		.where({
			auth_is_read: 0
		})
		.count()
		.then(res => {
			total = res.total
			if (total == 0) {
				return {
					total: total
				}
			} else {
				return total
			}
		})
		.then(total => {
			let unreadMsgRes = db.collection("message")
				.aggregate()
				.match({
					auth_is_read: 0
				})
				.sort({ // 按照时间排序
					addtime: -1
				})
				.skip((event.pageNo - 1) * event.pageSize).limit(event.pageSize) // 分页
				.end()
			return unreadMsgRes
		})
		.then(unreadMsgRes => {
			return {
				total: total,
				data: unreadMsgRes.list
			}
		})
}

// 获取单篇文章
async function GetSingleContent(event) {
	let db = cloud.database().collection("content");
	let _ = cloud.database().command
	let $ = _.aggregate; // 聚合操作符
	return db.aggregate()
		.match({
			_id: event.contentID
		})
		.lookup({ // 关联分类表
			from: 'category',
			localField: 'category',
			foreignField: '_id',
			as: 'category',
		})
		.lookup({ // 关联评论列表
			from: 'comment',
			// localField: '_id',
			// foreignField: 'content_id',
			let: {
				content_collection_id: '$_id'
			},
			pipeline: $.pipeline()
				.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
				.sort({
					com_time: -1
				})
				.done(),
			as: 'comment',
		})
		.end()
}

// 搜索文章
async function ContentSearch(event) {
	const db = cloud.database();
	let _ = cloud.database().command
	let $ = _.aggregate; // 聚合操作符
	return db.collection("content")
		.aggregate()
		.match({
			title: db.RegExp({
				regexp: event.keyWord,
				options: 'i',
			}),
			isShow: "1"
		})
		.lookup({ // 关联分类表
			from: 'category',
			localField: 'category',
			foreignField: '_id',
			as: 'category',
		})
		.lookup({ // 关联评论列表
			from: 'comment',
			let: {
				content_collection_id: '$_id' // content集合的_id字段
			},
			pipeline: $.pipeline() // 需要对评论时间做排序处理
				.match(_.expr($.eq(['$content_id', '$$content_collection_id'])))
				.sort({
					com_time: -1
				})
				.done(),
			as: 'comment',
		})
		.end()
}