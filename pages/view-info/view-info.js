// view-info.js
var util = require('../../utils/util.js');
var config = require('../../config.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    title:"",
    des: "",
    info_array:[],
    time:"",
    date:"",
    pri:"",
    info:"",
    collect:"",
    userInfo:{},
    pic:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    console.log(options)
    var info_array=options.info.split(";")
    var pic_array=options.pic.split(";")
    pic_array.pop()
    info_array.pop()
    var that=this
    this.setData({
      id: options.id,
      title: options.title,
      des: options.des,
      info_array: info_array,
      time: options.time,
      date: options.date,
      pri: 0,
      info: options.info,
      pic_array:pic_array,
      pic:options.pic,
    })
    
  },

  onShareAppMessage: function () {
    var data = this.data
    console.log('click')
  return {
      title: data.title,
      desc: data.desc,
      imageUrl: '/pages/images/post.png',
      path: "/pages/edit-info/edit-info?" + "id=" + data.id + "&title=" + data.title + "&des=" + data.des + "&info=" + data.info + "&time=" + data.time + "&date=" + data.date+"&pic="+data.pic,
      success: function (res) {
        //deadline 转成timestamp
        // strdate = "2015-08-09 08:01:36:789";
        // var d = new Date(strdate);
        // var timestamp = Math.round(d.getTime();
        wx.request({
          url: config.host + '/info-check',
          method: 'POST',
          data: {
            nickname: data.userInfo.nickName,
            path: data.userInfo.avatarUrl,
            title: data.title,
            des: data.des,
            collect: data.info,//用分号分割
            deadline: data.time_select + data.date_select,
            id:data.id,
            pic:data.pic,
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


    
  }
})