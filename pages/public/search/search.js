const app = getApp()
const util = require("../../../utils/util")
Page({
    data: {
        searchVal: "",
        search_history: null,
        hotTagList: ["Vue", "小程序", "CSS", "js", "2019", "2020", "篮球", "轮滑", "Gopro", "刷街"],
        loaded: false
    },
    onLoad() {
        wx.getStorage({
            key: "search_history",
            success: res => {
                console.log(res);
                this.setData({
                    search_history: res.data,
                    loaded: true
                })
            },
            fail: err => {
                console.log(err);
                this.setData({
                    search_history: []
                })
            }
        })
    },
    onShow() {
        if (this.data.loaded) {
            this.setData({
                searchVal: ""
            })
            wx.getStorage({
                key: "search_history",
                success: res => {
                    console.log(res);
                    this.setData({
                        search_history: res.data
                    })
                },
                fail: err => {
                    console.log(err);
                    this.setData({
                        search_history: []
                    })
                }
            })
        }
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
    removeSearchItem(e) {
        let searchItem = e.currentTarget.dataset.item;
        let curSearchHisList = this.data.search_history;
        let res = curSearchHisList.remove(searchItem)
        wx.setStorage({
            key: "search_history",
            data: res
        }).then(_ => {
            this.setData({
                search_history: res
            })
        })
    },
    clearSearchHistoryHandler() {
        wx.setStorage({
            key: "search_history",
            data: [],
            success: _ => {
                this.setData({
                    search_history: []
                })
            },
            fail: err => console.log(err)
        })
    },
    hotTagSearchHandler(e) {
        this.setData({
            searchVal: e.currentTarget.dataset.tag
        });
        wx.navigateTo({
            url: '../searchResult/searchResult',
            success: res => { // 发送数据到子页面
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromSearchPage', {
                    data: this.data.searchVal
                })
            },
        })
    },
    hisTagSearchHandler(e){
        this.setData({
            searchVal: e.currentTarget.dataset.tag
        });
        wx.navigateTo({
            url: '../searchResult/searchResult',
            success: res => { // 发送数据到子页面
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromSearchPage', {
                    data: this.data.searchVal
                })
            },
        })
    },
    go2result(e) {
        console.log("搜索内容为: ", this.data.searchVal);
        let keyword_his_arr = this.data.search_history;
        let _searchVal = this.data.searchVal;
        if (_searchVal.length == 0) {
            return wx.navigateBack({
                delta: 1
            })
        }
        if (_searchVal.trim() == "") {
            return wx.showToast({
                title: 'R U kidding me?',
                icon: "error"
            })
        }
        console.log(keyword_his_arr.indexOf(_searchVal.trim()))
        if (keyword_his_arr.indexOf(_searchVal.trim()) <= -1) {
            keyword_his_arr.push(_searchVal.trim())
        }
        this.setData({
            search_history: keyword_his_arr
        })
        wx.setStorage({
            key: "search_history",
            data: this.data.search_history
        }).then(_ => {
            wx.navigateTo({
                url: '../searchResult/searchResult',
                success: res => { // 发送数据到子页面
                    // 通过eventChannel向被打开页面传送数据
                    res.eventChannel.emit('acceptDataFromSearchPage', {
                        data: _searchVal
                    })
                },
            })
        }).catch(err => {
            console.log(err)
            wx.showToast({
                title: 'oh shit...',
                icon: 'error'
            })
        })
    }
})