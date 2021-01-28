const app = getApp()
const mediaData = require("./media_conf")
Page({
	data: {
		dataList: [], // 留言列表数据
		message: "", // 留言框的数据
		socialMediaList: mediaData,
		mediaDialogVisible: false, // 社交媒体弹窗
		modalVisibal: false, // 接收回复提示框的显示
		currentMediaLink: "", // 社交媒体列表
	},
	onLoad() {
		this.getMessageList()
	},
	inputHandler(e) { // 文本框输入监听
		this.setData({
			message: e.detail.value
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
			wx.showLoading({
				title: 'loading',
			});
			/* *******拦截评论内容,进行审核验证******* */
			wx.cloud.callFunction({
					name: "addHandler",
					data: {
						collection: "checkContent",
						content: this.data.message.trim()
					},
				})
				.then(res => {
					console.log("接口调用结果: ", res);
					if (res.result.errCode == 87014) { // 1- 留言内容有敏感内容
						wx.hideLoading();
						return wx.showToast({
							title: '评论不能太敏感噢',
						})
					} else { // 2- 留言内容正常,可提交
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
				})
		}
	},
	msgPost() { // 留言提交
		let obj = {
			addtime: new Date().getTime(),
			guest_avatar: this.data.userInfo.avatarUrl,
			guest_name: this.data.userInfo.nickName,
			message: this.data.message.trim(),
			openid: app.globalData.openid,
			auth_is_read: 0, // 作者是否已阅
			auth_response: []
		}
		wx.cloud.database().collection("message").add({
			data: obj
		}).then(res => {
			if (res.errMsg == "collection.add:ok") {
				this.getMessageList()
				this.setData({
					message: "",
					modalVisibal: true
				})
			}
		})
	},
	phoneCallHandler() { // 拨打电话
		wx.makePhoneCall({
			phoneNumber: '13143352449' //仅为示例，并非真实的电话号码
		})
	},
	openMediaLink(e) {
		let link = e.currentTarget.dataset.link;
		this.setData({
			mediaDialogVisible: true,
			currentMediaLink: link.url,
			currentMediaLinkIcon: link.name
		})
	},
	copyHandler(e) {
		let curLink = this.data.currentMediaLink
		wx.setClipboardData({
			data: curLink,
			success: res => {
				wx.getClipboardData({
					success: res => {
						console.log(res.data) // data
						setTimeout(() => {
							this.setData({
								mediaDialogVisible: false
							})
						}, 800);
					}
				})
			}
		})
	},
	dialogCloseHandler() {
		this.setData({
			mediaDialogVisible: false
		})
	},
	onShareAppMessage() {},
	SubscribeHandler(e) { // 订阅消息
		wx.requestSubscribeMessage({
			tmplIds: ['SFM32Vr2jBXvHar82Otokx2xKUxaWIqt1sQj6pKa6sE'],
			success: res => {
				console.log(res);
			},
			fail: err => {
				console.log(err);
			},
			complete: _ => {
				this.setData({
					modalVisibal: false
				})
				wx.showToast({
					title: 'Thanks~',
				})
			}
		})
	}
})