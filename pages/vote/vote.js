var util = require('../../utils/util.js');
var config = require('../../config.js');
var date_select;
var time_select;
var list_item = [1, 1];
var count = 2;
var start_date = util.formatDate(new Date());
var start_time = util.formatTime(new Date());
var flag = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
var app=getApp()
Page({
  data: {
    icon_remove: "/pages/images/remove.png",
    icon_add: "/pages/images/additem.png",
    showTopTips: false,
    date: start_date,
    time: start_time,
    date_select: start_date,
    time_select: start_time,
    isAgree: false,
    userInfo: {},
  },
  onShow: function () {
    flag = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    this.setData({
      flag: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      date_select: date_select,
      time_select: time_select
    });

  },
  onLoad:function(){
      var that=this
      app.getUserInfo(function (userInfo) {
        that.setData({
          userInfo: userInfo
        })
      })
  },
  delItem: function (e) {
    console.log(e)
    if (count <= 1)
      return
    count--
    flag[e.currentTarget.id] = 0
    this.setData({
      flag: flag
    });
  },

  addItem: function () {
    count++
    console.log(count)
    for (var i = 0; i < 10; i++) {
      if (flag[i] == 0) {
        flag[i] = 1
        break
      }
    }
    this.setData({
      flag: flag
    });
  },
  trim: function (str) {
    str = str.replace(/^\s+|\s+$/g, "");
    return str
  },
  
  formSubmit: function (e) {
    var data = e.detail.value
    console.log(data)
    var that = this
    var collect = ""
    var count = 0
    var tmp=""
    var msg=""
    var deadline = data.date_select + " " + data.time_select
    for (var i = 0; i < 20; i++) {
      if (data["" + i]) {
        count++
        tmp = tmp + data["" + i]
        collect = collect + data["" + i] + ";"
      }
    }
    if (data.title == null || this.trim(data.title).length == 0)
      msg = '标题不能为空'
    if (tmp == null || this.trim(tmp).length == 0)
        msg = '投票项不能为空'
    if (msg != '') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: msg,
        success: function (res) {
          if (res.confirm) {
            console.log('confirm')
            return;
          }
        }
      })
    }
    else{
      wx.request({
        url: config.host + '/vote-collect',
        method: 'POST',
        data: {
          openid: "",
          nickname: that.data.userInfo.nickName,
          path: that.data.userInfo.avatarUrl,
          title: data.title,
          des: data.des,
          collect: collect,//用分号分割
          deadline: data.time_select + data.date_select,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var id = res.data
          console.log(id)
          wx.navigateTo({
            url: "../view-vote/view-vote?anonymous=" + data.anonymous + "&mutivote=" + data.mutivote+ "&id=" + id+
            "&title=" + data.title + "&des=" + data.des + "&count=" + count +
            "&vote=" + collect + "&time=" + data.time_select + "&date=" + data.date_select
          })
        }
      })
    //todo 需要获取表id
    
    }
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