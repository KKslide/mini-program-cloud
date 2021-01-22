const app = getApp()

Page({
	data: {
		userInfo: {},
		hasUserInfo: false,
		isOverShare: false,
		resumeUrl: ""
	},
	onLoad: function () {
		wx.cloud.database().collection("resume")
			.get()
			.then(res => {
				let resumeList = res.data.reverse()
				this.setData({
					resumeUrl: resumeList[0].fileID
				})
			})
	},
	downloadHandler() {
		wx.cloud.downloadFile({
			fileID: this.data.resumeUrl, // 文件 ID
			success: res => {
				// 返回临时文件路径
				wx.openDocument({
					filePath: res.tempFilePath,
				})
			},
			fail: console.error
		})

	},
	onShareAppMessage() {}
})