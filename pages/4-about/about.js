const app = getApp()

Page({
	data: {
		userInfo: {},
		hasUserInfo: false,
		isOverShare: false
	},
	onLoad: function () {},
	downloadHandler() {
		wx.cloud.downloadFile({
			fileID: 'cloud://kangyouknowwho-8ge6apb585a940c6.6b61-kangyouknowwho-8ge6apb585a940c6-1304576484/3年-web前端开发-刘永康.docx', // 文件 ID
			success: res => {
				// 返回临时文件路径
				// console.log(res.tempFilePath)
				wx.openDocument({
				  filePath: res.tempFilePath,
				})
			},
			fail: console.error
		})

	},
	onShareAppMessage() {}
})