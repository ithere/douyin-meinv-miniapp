//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello mosou',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    downloadRes: '',
    douyinData: '',
    isLoading: false,
    getUrl: app.globalData.getUrl,
    url: app.globalData.url
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function(option) {
    const that = this
    that.getDouyinData()
    return
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
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
  wxOnDownFile:function(url) {
    const that = this
    const downloadTask = wx.downloadFile({
      url: url,
      filePath: '',
      success: (res) => {
        that.setData({
          downloadRes: res
        })
        that.downSuccess()
      }
    })
  },
  downSuccess:function() {
    const that = this
    wx.hideLoading()
    wx.saveVideoToPhotosAlbum({
      filePath: that.data.downloadRes.tempFilePath,
      success: function(res) {
        wx.showToast({
          title: '保存成功',
        })
      }
    })
    return
  },
  getRand:function() {
    const that = this
    const num = Math.ceil(Math.random() * 10)
    if (!num) {
      that.getRand()
    }
    return num
  },
  getDouyinData:function(url = '') {
    const that = this
    var num = that.getRand() - 0
    url = that.data.url
    wx.request({
      url: url + '/open/douyin/likeData/'+(201900000000000 + num),
      success: function(data) {
        console.log(data)
        const retData = data.data
        if (retData.aweme_list.length) {
          let douyinData = retData.aweme_list
          that.setData({
            douyinData,
            isLoading: false
          })
          wx.hideLoading()
        } else {
          setTimeout(() => {
            that.getDouyinData(url)
          }, 300)
          return
        }
      },
      fail: function(err) {
        wx.hideLoading()
      }
    })
  },
  douyinApi:function(e = '') {
    const that = this
    var shortUrl = e.currentTarget.dataset.url
    if (!shortUrl) {
      return
    }
    wx.request({
      url: that.data.getUrl,
      method:'POST',
      header:{
        'Content-Type':'application/x-www-form-urlencoded'
      },
      data:{
        url: encodeURIComponent(shortUrl)
      },
      success:function(data){
        if(data.data){
          wx.showLoading({
            title: '正在下载',
            mask: true
          })
          that.wxOnDownFile(data.data)
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.hideLoading()
    this.setData({
      isClose: true
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    wx.hideLoading()
    this.setData({
      isClose: true
    })
  },
  onPullDownRefresh: function(){
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getDouyinData()
  }
})