//获取应用实例
const app = getApp()
const html = require("./aaa.js");
const WxParse = require("../../../utils/wxParse/wxParse");

Page({
  data: {
    userInfo:{},
    content:html.content,
    videoPoster:"http://example.kkslide.fun/upload_f5775b20fce5d152445eb50f0020c4a4",
    videoSrc:"http://example.kkslide.fun/trip-in-guilin_v2.mp4",
    // http://example.kkslide.fun/daily.mp4
    videoSrc:"http://example.kkslide.fun/daily.mp4",
    textAreaFocus:false
  },
  commentHandler(e){ // 点击评论的时候
    const query = wx.createSelectorQuery();
    this.setData({textAreaFocus:true});
    wx.pageScrollTo({
      duration: 300,
      selector:"#comment"
    })
  },
  blurHandler(){ // 失去焦点的时候
    this.setData({
      textAreaFocus:false
    })
  },
  backHandler(){ // 返回上一页
    wx.navigateBack({delta:1})
  },
  onLoad: function () {
    var that = this;
    WxParse.wxParse('article', 'html', html.content, that, 5);
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
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})
