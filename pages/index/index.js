//index.js
//获取应用实例
var app = getApp()
var helloData={}
Page({
  //json datatype
  data: {
    userInfo: {},
    icon_collect:'/pages/images/info.png',
    icon_vote:'/pages/images/vote.png',
    icon_oval:'/pages/images/oval.png'
  },
  //事件处理函数
  bindInfo: function () {
    wx.navigateTo({
      url: "../info/info"
    })
  },
  bindVote: function () {
    wx.navigateTo({
      url: "../vote/vote"
    })
  },
  onPullDownRefresh: function () {
    console.log("refresh")
    this.onLoad()
    wx.stopPullDownRefresh()
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  }
})
