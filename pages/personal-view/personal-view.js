// personal-view.js
var util = require('../../utils/util.js');
var config = require('../../config.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      title:"",
      id:0,
      num:0,
      toast:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options)
      this.setData({
        id: options.requestid,
        title: options.title,
        des:options.des,
        num: options.num,
      }) 
  },
  mail_send: function (email) {
    var that=this
    wx.request({
      url: config.host + '/mail-send',
      method: 'POST',
      data: {
        id: that.data.id,
        add: email,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        // wx.navigateTo({
        //   url: "/pages/index/index" 
        // })
      }
    })
  },
  output: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['收藏到微信', '发送到邮箱'],
      success: function (res) {
        console.log(res)
        if (!res.cancel) {
          if(res.tapIndex==1)
              that.mail_send('245304321@qq.com')
          // that.setData({
          //   toast: false, //弹窗显示
          // })
          }
        
      }
    });
  },
  
  view: function () {
    wx.navigateTo({
      url: "../personal-item/personal-item?id="+this.data.id
    })
  }
})