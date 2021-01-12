const app = getApp()

Page({
  data: {
    motto: 'fucking test',
    userInfo: {},
    hasUserInfo: false,
    isOverShare:false
  },
  onLoad: function () {
    this.setData({
      nbTitle: 'Kangyouknowwho',
      nbFrontColor: '#fff',
      nbBackgroundColor: '#000000',
      navH: app.globalData.navHeight // 自定义头部方法
    });
  },
  onShareAppMessage(){}
})