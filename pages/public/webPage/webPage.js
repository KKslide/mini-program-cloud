const app = getApp()

Page({
    data: {
        url: ""
    },
    onLoad() {
        console.log("loaded");

        // const eventChannel = this.getOpenerEventChannel();
        // eventChannel.on("acceptDataFromParentPage", data => {
        //     let _url = data.data; // 要搜索的关键字
        //     console.log(_url)
        //     if (_url) {
        //         this.setData({
        //             url: 'https://baidu.com'
        //         });
        //         // wx.setNavigationBarTitle({
        //         //     title: `Result:[${_keyWord}]...`,
        //         // });
        //     }
        // })
    },
    onShow() {
        
    },

    error(err){
        console.log(err,'111');
    }
})