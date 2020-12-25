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
		noContent: false, // 没有当前栏内容flag
	},
	getCategoryList(callback) { // 获取分类
		let db = wx.cloud.database().collection("category");
		db.field({
			_id: true,
			name: true
		}).orderBy("addtime", "asc").get({
			success: res => {
				this.setData({
					categoryList: res.data,
					curActiveID: res.data.filter(v => {
						return v.name == this.data.curActiveClass;
					})[0]["_id"]
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
		console.log(this.data.curActiveID);
		wx.cloud.callFunction({
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
		}).catch(err => {
			console.log(err);
		})

	},
	go2detail: function (e) { // 跳转详情页
		// let src = e.currentTarget.dataset['param'];
		wx.navigateTo({
			url: '../public/content/content',
			fail: function (err) {
				console.log(err)
			}
		})
	},
	switchCate(e) { // 点击tab栏
		let curCategoryData = e.currentTarget.dataset.cate;
		this.setData({
			curActiveClass: curCategoryData.name,
			curActiveID: curCategoryData._id
		});
		wx.nextTick(_=>{
			this.getContentList()
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
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		// console.log("bottom !!!!");
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		console.log("!!!!!!!");
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})