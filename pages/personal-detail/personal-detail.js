// personal-detail.js
var util = require('../../utils/util.js');
var config = require('../../config.js');
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    col_array:[],
    info_array:[],
    userInfo:{},
    dot:"/pages/images/oval2.png",
    pic:'',
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    wx.request({
      url: config.host + '/detail-get', 
      method: 'POST',
      data: {
        requestid: options.requestid,
        openid:options.openid
      },
      success: function (res) {
        console.log(res.data)
        var pic_array2 = []
        var col_array=[]
        var info_array=[]
        var pic=''

        if (res.data.col != null &&res.data.col.length > 0){

        col_array=res.data.col.split(";")
        col_array.pop()
        info_array=res.data.info.split(";")
        info_array.pop()
        }
        
        if (res.data.pic!=null){
          pic = res.data.pic
        }

        if (res.data.pic_info != null &&res.data.pic_info.length>0){
          var pic_array=res.data.pic_info.split(';')
          pic_array.pop()
          for(var i=0;i<pic_array.length;i++){
            pic_array2[i] = config.host + '/download_pic/' + options.requestid+'/'+res.data.nickname+'/'+pic_array[i]
        }
        console.log(pic_array2)
        }
        that.setData({
          requestid: options.requestid,
          pic:pic,
          pic_info:pic_array2,
          col_array:col_array,
          info_array:info_array,
          userInfo:{'avatar':res.data.avatar,
              'nickname':res.data.nickname},
        })
        // wx.navigateTo({
        //   url: "/pages/index/index" 
        // })
      }
    })
  },
  previewImage: function (e) {
    console.log(this.data.pic_array2)
    wx.previewImage({
      current: e.currentTarget.id, 
      urls: this.data.pic_info,
    })
  }

  
})