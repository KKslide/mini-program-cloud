const app = getApp()
const util = require("../../../utils/util")

Page({
    data: {
        searchResultData: []
    },
    onLoad() {
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on("acceptDataFromSearchPage", data => {
            let keyWord = data.data; // 要搜索的关键字
            wx.setNavigationBarTitle({
                title: `Result:[${keyWord}]...`,
            });
            const db = wx.cloud.database();
            db.collection("content").where({
                    title: db.RegExp({
                        regexp: keyWord,
                        options: 'i',
                    })
                })
                .get()
                .then(res => {
                    this.setData({
                        searchResultData: res.data
                    })
                })
                .catch(err => {
                    console.log(err);
                })
        })
    }
})