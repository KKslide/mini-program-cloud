//获取应用实例
const app = getApp()
const html = require("./aaa.js");
const WxParse = require("../../../utils/wxParse/wxParse");

Page({
	data: {
		userInfo: {},
		content: html.content, // 文章内容
		poster: "http://example.kkslide.fun/upload_f5775b20fce5d152445eb50f0020c4a4", // 文章封面
		videoSrc: "http://example.kkslide.fun/trip-in-guilin_v2.mp4", // 文章视频链接
		textAreaFocus: false, // 文本框聚焦
	},
	commentHandler(e) { // 点击评论的时候-跳转至输入框
		const query = wx.createSelectorQuery();
		this.setData({
			textAreaFocus: true
		});
		wx.pageScrollTo({
			duration: 300,
			selector: "#comment"
		})
	},
	blurHandler() { // 失去焦点的时候
		this.setData({
			textAreaFocus: false
		})
	},
	backHandler() { // 返回上一页
		wx.navigateBack({
			delta: 1
		})
	},
	onLoad: function (option) {
		var that = this;
		WxParse.wxParse('article', 'html', html.content, that, 5); // wxparse解析文章内容

		const eventChannel = this.getOpenerEventChannel();
		// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
		eventChannel.on('acceptDataFromOpenerPage', function (data) {
			console.log(data)
		})

		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
			})
		} else {
			wx.getUserInfo({
				success: res => {
					app.globalData.userInfo = res.userInfo
					this.setData({
						userInfo: res.userInfo,
					})
				}
			})
		}
	},
	getUserInfo: function (e) {
		console.log(e)
		app.globalData.userInfo = e.detail.userInfo
		this.setData({
			userInfo: e.detail.userInfo,
			hasUserInfo: true
		})
	},
})