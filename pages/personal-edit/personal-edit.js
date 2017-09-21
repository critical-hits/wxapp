var util = require('../../utils/util.js');
var config = require('../../config.js');
var date_select;
var time_select;
var list_item = [1, 1];
var count = 1;
var start_date = util.formatDate(new Date());
var start_time = util.formatTime(new Date());
Page({
  data: {
    icon_remove: "/pages/images/remove.png",
    icon_add: "/pages/images/additem.png",
    showTopTips: false,
    date: start_date,
    time: start_time,
    date_select: start_date,
    time_select: start_time,
    isAgree: false
  },
  onShow: function () {
    this.setData({
      list_item: list_item,
      date_select: date_select,
      time_select: time_select
    });

  },

  addItem: function () {
    var newarray = [1];
    this.setData({
      list_item: newarray.concat(this.data.list_item)
    });
  },

  formSubmit: function (e) {
    var data = e.detail.value
    var that = this
    console.log(data)
    var collect = ""
    var count = 0
    var deadline = data.date_select + " " + data.time_select
    for (var i = 0; i < 20; i++) {
      if (data["" + i]) {
        count++
        collect = collect + data["" + i] + ";"
      }
    }
    var user = getApp().globalData.userInfo
    //todo 需要获取openid
    wx.request({
      url: config.host + '/info-collect', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        openid: "",
        nickname: user.nickName,
        path: user.avatarUrl,
        title: data.title,
        des: data.des,
        collect: collect,//用分号分割
        deadline: deadline,
        pri: data.pri
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var id = res.data
        console.log(res.data)
        wx.navigateTo({
          url: "../view-info/view-info?" + "id=" + id +
          "&title=" + data.title + "&des=" + data.des + "&count=" + count +
          "&info=" + collect + "&time=" + data.time_select + "&date=" + data.date_select + "&pri=" + data.pri
        })
      }
    })
    // this.setData({
    //   showTopTips: true
    // });
    // setTimeout(function () {
    //   this.setData({
    //     showTopTips: false

    //   });
    // }, 3000);
  },

  bindDateChange: function (e) {
    this.setData({
      date_select: e.detail.value
    })
  },

  bindTimeChange: function (e) {
    this.setData({
      time_select: e.detail.value
    })
  },

  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
});