// view-info.js
var util = require('../../utils/util.js');
var config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    title: "" ,
    des: "" ,
    vote_array: [],
    time: "",
    date: "",
    anonymous: false,
    mutivote:false, 
    vote:"",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var vote_array = options.vote.split(";")
    vote_array.pop()
    this.setData({
      id: options.id,
      title: options.title,
      des:options.des,
      vote_array: vote_array,
      time: options.time,
      date: options.date,
      anonymous: options.anonymous,
      // mutivote: options.mutivote,
      vote: options.vote,
      collect:options.vote
    })
  },

  onShareAppMessage: function () {
    var data = this.data
    var user = getApp().globalData.userInfo
    var deadline = data.date + " " + data.time
    console.log('click')
    return {
      title: data.title,
      des: data.des,
      imageUrl: '/pages/images/post.png',
      path: "/pages/edit-vote/edit-vote?" + "id=" + data.id + "&anonymous=" + data.anonymous + "&mutivote=" + data.mutivote +
      "&title=" + data.title + "&des=" + data.des + "&vote=" + data.collect + "&time=" + data.time_select + "&date=" + data.date_select,
      success: function (res) {
        //deadline 转成timestamp
        // strdate = "2015-08-09 08:01:36:789";
        // var d = new Date(strdate);
        // var timestamp = Math.round(d.getTime();
        wx.request({
          url: config.host + '/vote-check',
          method: 'POST',
          data: {
            id:data.id,
            nickname: user.nickName,
            path: user.avatarUrl,
            title: data.title,
            des: data.des,
            collect: data.collect,
            deadline: deadline,
            anonymous: data.anonymous,
            mutivote: data.mutivote,
          },
          header: {
            'content-type': 'application/json'
          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})