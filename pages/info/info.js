var util = require('../../utils/util.js');
var date_select;
var time_select;
var list_item=[1];
var count=1;
var start_date=util.formatDate(new Date());
var start_time=util.formatTime(new Date());
Page({
  data: {
    showTopTips: false,
    date:start_date,
    time:start_time,
    date_select:start_date,
    time_select:start_time,
    isAgree: false
  },
  onShow: function () {
    this.setData({ list_item: list_item ,
     date_select:date_select,
     time_select:time_select});
    
  },

  addItem: function () {
    var newarray =[1];
    this.setData({
      list_item: newarray.concat(this.data.list_item)
    });
  },

  showTopTips: function () {
    wx.request({
      url: 'http://127.0.0.1:5000/', //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
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
    console.log(e.detail.value)
    this.setData({
      date_select: e.detail.value
    })
  },

  bindTimeChange: function (e) {
    console.log(e.detail.value)
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