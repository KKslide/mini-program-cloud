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
		isOverShare: false,
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
				let _listType = null;
				switch (_curActiveID[0]["list_type"]) {
					case "1":
						_listType = "type_1"
						break;
					case "2":
						_listType = "type_2"
						break;
					case "3":
						_listType = "type_3"
						break;

					default:
						_listType = "type_default"
						break;
				}
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
		this.setData({
			curActiveClass: curCategoryData.name,
			curActiveID: curCategoryData.name == "HOT" ? "HOT" : curCategoryData._id,
			listType: "type_1"
		});
		console.log(curCategoryData);
		wx.nextTick(_ => {
			this.getContentList().then(_ => {
				this.setData({
					topNum: 0
				})
			})
		});
	},
	scrollHandler() { // 页面滚动
		// console.log("it`s scrolling !!!");
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
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})