// persona-item.js
var app = getApp()
var util = require('../../utils/util.js');
var config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    userInfos:[],
    icon:"/pages/images/arrow.png"
  },

  onLoad: function (options) {
    var that = this
    console.log(options)
    wx.request({
      url: config.host + '/item-get', 
      method: 'POST',
      data: {
        requestid: options.id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        that.setData({
          userInfos: res.data
        })
        // wx.navigateTo({
        //   url: "/pages/index/index" 
        // })
      }
    })
  },
  detail:function(e){
      var data=this.data
      var index=e.currentTarget.id
      wx.navigateTo({
        url: "../personal-detail/personal-detail?openid=" +data.userInfos[index].openid
        +"&requestid="+data.userInfos[index].requestid
      })
  },
})