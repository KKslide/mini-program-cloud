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
	}
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
			 */
			if (res.data.length != 0) {
				return db.get()
			} else {
				return cloud.callFunction({
						name: "addHandler",
						data: {
							collection: "category",
							name: "HOT",
							banner: event.banner || "http://example.kkslide.fun/banner.jpg",
							addtime: event.addtime || new Date(),
							edittime: event.edittime || new Date(),
							index: event.index || 0
						}
					})
					.then(addRes => {
						console.log(addRes);
						return db.get()
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
	return await db.where(searchObj).count()
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

// 留言集合获取
async function MessageGetHandler(event) {
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
	return db.aggregate()
		.lookup({ // 关联分类表
			from: 'category',
			localField: 'category',
			foreignField: '_id',
			as: 'category',
		})
		.lookup({ // 关联评论列表
			from: 'comment',
			localField: '_id',
			foreignField: 'content_id',
			as: 'comment',
		})
		.sort({ // 按照时间排序
			addtime: -1
		})
		.skip((event.pageNo - 1) * event.pageSize).limit(event.pageSize) // 分页
		.end()
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