const app = getApp()

Page({
    data: {
        searchResultData: null,
        keyWord: ""
    },
    onLoad() {
        this.setSearchData()
            .then(_ => {
                this.getSearchResultList()
            })
    },
    setSearchData() {
        const eventChannel = this.getOpenerEventChannel();
        return new Promise((resolve, reject) => {
            eventChannel.on("acceptDataFromSearchPage", data => {
                let _keyWord = data.data; // 要搜索的关键字
                if (_keyWord) {
                    this.setData({
                        keyWord: _keyWord
                    });
                    wx.setNavigationBarTitle({
                        title: `Result:[${_keyWord}]...`,
                    });
                    resolve()
                } else {
                    reject()
                }
            })
        })
    },
    getSearchResultList() {
        wx.showLoading({
            title: 'searching...',
            icon: "loading"
        })
        wx.cloud.callFunction({
            name: "getHandler",
            data: {
                collection: "content_search",
                keyWord: this.data.keyWord
            }
        }).then(res => {
            console.log(res)
            if (res.errMsg == "cloud.callFunction:ok" && res.result && res.result.errMsg == "collection.aggregate:ok") {
                this.setData({
                    searchResultData: res.result.list
                })
            } else {
                wx.showToast({
                    title: "No Matched!!",
                    icon: "error"
                })
            }
            wx.hideLoading()
        }).catch(err => {
            console.log(err);
        }).finally(_ => {
            wx.hideLoading()
        })
    },
    go2detail(e) {
        let contentData = this.data.searchResultData.filter(v => {
            return v._id == e.currentTarget.dataset.id
        })[0]
        wx.navigateTo({
            url: '../content/content',
            events: {
                updateContentList: data => { // 更新数据
                    this.getSearchResultList();
                }
            },
            success: res => { // 发送数据到子页面
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', {
                    data: contentData
                })
            },
        })
    }
})