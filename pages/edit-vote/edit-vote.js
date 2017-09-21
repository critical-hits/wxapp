var util = require('../../utils/util.js');
var config = require('../../config.js');
var flag=[0,0,0]
var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    title: "",
    des: "" ,
    vote_array: [],
    flag:[0,0,0],
    time: "",
    date: "",
    anonymous: false,
    mutivote: false,
    vote: "",
    toast_msg: '已投票',
    hiddenToast: true,
    target:-1,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var vote_array = options.vote.split(";")
    vote_array.pop()
    var that=this
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        id: options.id,
        title: options.title,
        des: options.des,
        vote_array: vote_array,
        time: options.time,
        date: options.date,
        anonymous: options.anonymous,
        mutivote: options.mutivote,
        vote: options.vote,
      })
    })
  },
  voteClick:function(e){
    var id = e.currentTarget.id
    if (flag[id] == 1)
      flag[id] = 0
    else {
      for (var i = 0; i < flag.length; i++) {
        flag[i] = 0
      }
      flag[id] = 1;
    }
    this.setData({
      flag:flag,
      target:e.currentTarget.id,
    })
  },
  
  vote:function(e){
    if (this.data.target<0)
      {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '未选择投票项', 
        })
        return
      }
    var history=wx.getStorageSync(this.data.id)
    if (history==1){
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '你已经提交过了',
      })
      return
    }
    var that = this  
    wx.request({
      url: config.host + '/vote', 
      method: 'POST',
      data: {
        id: this.data.id,
        vote:this.data.target,
    nickname:this.data.userInfo.nickName,
    avatar:this.data.userInfo.avatarUrl,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.setStorageSync(
          that.data.id,1
        )
        console.log(res.data)
        that.setData({
          hiddenToast: 
          !that.data.hiddenToast
        })
      }
    })
  },
  toastHidden: function () {
    this.setData({
      hiddenToast: true
    })
    // this.onPullDownRefresh()
  },
})