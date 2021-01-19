const app = getApp()

Page({
    data: {
        url: "",
    },
    onLoad() {
    },
    onShow() {
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on("acceptDataFromParentPage", data => {
            let _url = data.data; // 要搜索的关键字
            if (_url) {
                this.setData({
                    url: _url
                });
            }
        })
    },
})