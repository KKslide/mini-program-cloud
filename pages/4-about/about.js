const app = getApp()

Page({
	data: {
		year: new Date().getFullYear() - 2017, // 出道至今
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
	downloadHandler() { // 下载简历
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
	onShareAppMessage() {},
	previewMyPhoto(e) {
		// console.log(e)
		let imgUrl = e.currentTarget.dataset.src;
		wx.previewImage({
			current: imgUrl, // 当前显示图片的http链接
			urls: [imgUrl] // 需要预览的图片http链接列表
		})
	}
})