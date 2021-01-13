const app = getApp()

Page({
	data: {
		userInfo: {},
		hasUserInfo: false,
		isOverShare: false
	},
	onLoad: function () {
		this.setData({
			nbTitle: 'Kangyouknowwho',
			nbFrontColor: '#fff',
			nbBackgroundColor: '#000000',
			navH: app.globalData.navHeight // 自定义头部方法
		});
	},
	onShow() {
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
			});
		}
	},
	onShareAppMessage() {}
})