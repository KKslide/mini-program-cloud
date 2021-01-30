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
	onReady() {
		wx.cloud.callFunction({
				name: "getHandler",
				data: {
					collection: "message",
					pageNo: 1,
					pageSize: 3,
					auth_is_read: "1",
					guest_name: "",
					rangeTime: [],
					message: ""
				}
			})
			.then(res => {
				console.log(res);
			})
	},
	downloadHandler() { // 下载简历
		wx.showLoading({
			title: 'loading...',
		})
		wx.cloud.downloadFile({
			fileID: this.data.resumeUrl, // 文件 ID
			success: fileRes => {
				wx.hideLoading({
					success: (res) => {
						// 返回临时文件路径
						wx.openDocument({
							filePath: fileRes.tempFilePath,
						})
					},
				})
			},
			fail: (err => {
				console.log(err);
			})
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