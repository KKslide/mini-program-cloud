const app = getApp()

Page({
  data: {
    dataList:[]
  },
  onLoad() {
    wx.request({
      url: 'http://localhost/index/message/get',
      success: res=> {
        this.setData({
          dataList : res.data
        });
      }
    })
  }
})