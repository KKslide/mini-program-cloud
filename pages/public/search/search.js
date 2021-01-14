const app = getApp()

Page({
    data: {
        searchVal: ""
    },
    onLoad() {
        console.log("onload");
    },
    inputHandler(e) {
        this.setData({
            searchVal: e.detail.value
        })
    },
    clearValue() {
        this.setData({
            searchVal: ""
        })
    },
    go2result() {
        console.log(this.data.searchVal);
        // return
        wx.navigateTo({
            url: '../searchResult/searchResult',
            success: res => { // 发送数据到子页面
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromSearchPage', {
                    data: this.data.searchVal
                })
            },
        })
    }
})