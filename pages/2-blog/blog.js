const app = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		categoryList: [],
		contentList: [],
		curActiveClass: 'HOT',
		curActiveID: null, // 当前navigation的ID号
		listType: null, // 当前分类的展示类型
		noContent: false, // 没有当前栏内容flag
		isOverShare: true,
	},
	getCategoryList(callback) { // 获取分类-无权限要求,直接获取,不调用云函数
		let db = wx.cloud.database().collection("category");
		db.field({
			_id: true,
			name: true,
			list_type: true
		}).where({
			"isShow": "1"
		}).orderBy("index", "asc").get({
			success: res => {
				let _curActiveID = res.data.filter(v => {
					return v.name == this.data.curActiveClass;
				});
				let _listType = this.getListType(_curActiveID[0]["list_type"]);
				this.setData({
					categoryList: res.data,
					curActiveID: _curActiveID[0]["name"] == "HOT" ? "HOT" : _curActiveID[0]["_id"],
					listType: _listType
				});
				wx.nextTick(_ => {
					if (callback) callback()
				})
			},
			fail(err) {
				console.log(err);
			}
		})
	},
	getContentList() { // 获取文章列表
		wx.showLoading({
			title: 'loading...',
			mask: true
		});
		return wx.cloud.callFunction({
			name: "getHandler",
			data: {
				collection: "content",
				content_type: "mini_program",
				category_id: this.data.curActiveID
			}
		}).then(res => {
			if (res.result.list.length == 0) {
				this.setData({
					contentList: res.result.list,
					noContent: true
				})
			} else {
				this.setData({
					contentList: res.result.list,
					noContent: false
				})
			}
			wx.hideLoading()
		}).catch(err => {
			console.log(err);
		})

	},
	go2detail: function (e) { // 跳转详情页
		let article_chosen = this.data.contentList.filter(v => {
			return v._id == e.currentTarget.dataset["param"];
		})[0];
		wx.navigateTo({
			url: '../public/content/content',
			events: {
				updateContentList: data => { // 更新数据
					this.getContentList();
				}
			},
			success: function (res) { // 发送数据到子页面
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptDataFromOpenerPage', {
					data: article_chosen
				})
			},
			fail: function (err) {
				console.log(err)
			}
		})
	},
	go2search: function (e) { // 去到搜索页
		wx.navigateTo({
			url: '../public/search/search',
		})
	},
	switchCate(e) { // 点击tab栏
		let curCategoryData = e.currentTarget.dataset.cate;
		if(curCategoryData.name == this.data.curActiveClass) return;
		this.setData({
			curActiveClass: curCategoryData.name,
			curActiveID: curCategoryData.name == "HOT" ? "HOT" : curCategoryData._id
		});
		wx.nextTick(_ => {
			this.getContentList().then(_ => {
				this.setData({
					topNum: 0,
					listType: this.getListType(curCategoryData.list_type)
				})
			})
		});
	},
	shareHandler(e) { // 点击列表分享按钮,防止事件冒泡
		return
	},
	scrollHandler() { // 页面滚动
		// console.log("it`s scrolling !!!");
	},
	getListType(val) { // 获取布局类型
		let _listType = null;
		switch (val) {
			case "1":
				_listType = "type_1" // 瀑布流
				break;
			case "2":
				_listType = "type_2" // 图文型
				break;
			// case "3":
			// 	_listType = "type_3" // 日志型
			// 	break;
			default:
				_listType = "type_default" // 默认混合型
				break;
		}
		return _listType
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.setData({
			navH: app.globalData.navHeight // 自定义头部方法
		});
		this.getCategoryList(_ => {
			this.getContentList()
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		this.setData({
			nbLoading: false
		})
	},

	/**
	 * 用户点击分享操作
	 */
	onShareAppMessage(res) {
		// 来自页面内转发按钮
		if (res.from === 'button') {
			console.log(res);
			return {
				title: res.target.dataset.title,
				path: '/pages/public/content/content?contentID=' + res.target.dataset.id,
				imageUrl: res.target.dataset.poster || ""
			}
		} else {
			return {
				title: 'Kangyouknowwho',
				path: "/pages/1-index/index", //若无path 默认跳转分享页
				imageUrl: 'https://6b61-kangyouknowwho-8ge6apb585a940c6-1304576484.tcb.qcloud.la/kk-image.jpg?sign=101b0c289435ff24c8410683934337c1&t=1611462052' //若无imageUrl 截图当前页面
			}
		}
	}
})