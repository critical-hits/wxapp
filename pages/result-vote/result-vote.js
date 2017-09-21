var util = require('../../utils/util.js');
var config = require('../../config.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    title: "",
    des: "",
    vote_array: [],
    time: "",
    date: "",
    anonymous: false,
    mutivote: false,
    vote: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var col_array =[]
    var vote_array=[]
    var that = this
    wx.request({
      url: config.host + '/vote-detail', 
      method: 'POST',
      data: {
        requestid: options.requestid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        var data = res.data
        col_array = data.col.split(";")
        col_array.pop()
        var len = new Array(parseInt(col_array.length));
        var max=0
        var max_index=0
        for (var i=0;i<col_array.length;i++)
        {   
            if (data[i].length>max){
              max = data[i].length
              max_index=i
            }
            vote_array[i]=data[i].length
            len[i]=(parseInt(data[i].length)/parseInt(options.num)*650)
        } 
        that.setData({
          max_index:max_index,
          col_array: col_array,
          vote_array:  vote_array,
          len:len
        })
      }
    })
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
})