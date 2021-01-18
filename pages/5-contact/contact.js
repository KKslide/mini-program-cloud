const app = getApp()

Page({
	data: {
		dataList: [], // 留言列表数据
		message: "", // 留言框的数据
		socialMediaList:[
			{name:"github",url:"https://github.com/KKslide"},
			{name:"facebook",url:"https://www.facebook.com/profile.php?id=100025250295698"},
			{name:"twitter",url:"https://twitter.com/KK_slide"},
			{name:"instagram",url:"https://www.instagram.com/kang1105_/"},
			{name:"weibo",url:"https://weibo.com/kkslide"},
			{name:"bilibili",url:"https://space.bilibili.com/334163601"}
		]
	},
	inputHandler(e) { // 文本框输入监听
		this.setData({
			message: e.detail.value
		})
	},
	// blurHandler(e) { // 文本框失焦监听
	// 	this.setData({
	// 		message: e.detail.value
	// 	})
	// },
	go2detail(e){
		let url = e.currentTarget.dataset.url;
		wx.navigateTo({
		  url: '../public/webPage/webPage',
		  success: res => { // 发送数据到子页面
			// 通过eventChannel向被打开页面传送数据
			// res.eventChannel.emit('acceptDataFromParentPage', {
			// 	data: url
			// })
		},
		})
	},
	getMessageList() { // 获取留言列表
		wx.showLoading({
			title: 'loading...',
		});
		let db = wx.cloud.database().collection("message");
		db.orderBy("addtime", "desc").get({
			success: res => {
				this.setData({
					dataList: res.data
				});
				wx.hideLoading();
			},
			fail: err => {
				console.log(err);
			}
		})
	},
	msgSubmit(e) { // 确定按钮点击监听
		if (this.data.message.trim() == "" || this.data.message.length > 200) {
			wx.showToast({
				title: '请检查留言内容',
				icon: 'error',
				mask: true,
				duration: 1500
			});
		} else {
			if (app.globalData.userInfo) {
				this.setData({
					userInfo: app.globalData.userInfo,
				});
				this.msgPost()
			} else {
				wx.getUserInfo({
					success: res => {
						console.log("用户数据获取成功：", res);
						app.globalData.userInfo = res.userInfo;
						this.setData({
							userInfo: res.userInfo,
						});
						this.msgPost()
					},
					fail: err => {
						console.log(err);
					}
				})
			}
		}
	},
	msgPost() { // 留言提交
		let obj = {
			addtime: new Date().getTime(),
			guest_avatar: this.data.userInfo.avatarUrl,
			guest_name: this.data.userInfo.nickName,
			message: this.data.message.trim()
		}
		wx.cloud.database().collection("message").add({
			data: obj
		}).then(res => {
			if (res.errMsg == "collection.add:ok") {
				this.getMessageList()
				this.setData({
					message: ""
				})
			}
		})
	},
	onLoad() {
		this.getMessageList()
	},
	phoneCallHandler() {
		wx.makePhoneCall({
			phoneNumber: '13143352449' //仅为示例，并非真实的电话号码
		})
	},
	onShareAppMessage() {}
})