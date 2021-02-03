App({
	onLaunch: function () {
		wx.cloud.init({
			env: "kangyouknowwho-8ge6apb585a940c6",
			traceUser: true
		})

		wx.cloud.callFunction({
			name: "getOpenID"
		}).then(res => {
			this.globalData.openid = res.result.openid
		})

		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				}
			}
		})

		wx.getSystemInfo({
			success: res => {
				//导航高度
				this.globalData.navHeight = res.statusBarHeight + 46;
			},
			fail(err) {
				console.log(err);
			}
		})

		this.onShareAppMessage()
	},
	// 引入`towxml3.0`解析方法
	towxml: require('/towxml/index'),
	globalData: {
		openid: "",
		userInfo: null,
		navHeight: 0
	},
	onShareAppMessage() {
		wx.onAppRoute(() => {
			console.log('当前页面路由发生变化 触发该事件onShareAppMessage')
			const pages = getCurrentPages() //获取加载的页面
			const view = pages[pages.length - 1] //获取当前页面的对象
			if (!view) return false //如果不存在页面对象 则返回
			// 若想给个别页面做特殊处理 可以给特殊页面加isOverShare为true 就不会重写了
			// const data = view.data
			var data = view.data
			if (!data.isOverShare) {
				data.isOverShare = true
				view.onShareAppMessage = () => { //重写分享配置
					return {
						title: 'Kangyouknowwho',
						path: "/pages/1-index/index", //若无path 默认跳转分享页
						imageUrl: 'https://6b61-kangyouknowwho-8ge6apb585a940c6-1304576484.tcb.qcloud.la/kk-image.jpg?sign=101b0c289435ff24c8410683934337c1&t=1611462052' //若无imageUrl 截图当前页面
					}
				}
			}
		})
	},
})