// personal.js
var util = require('../../utils/util.js');
var config = require('../../config.js');
var flag =new Array(100)
var app=getApp()
var len=100
Page({
  /**
   * 页面的初始数据
   */
  data: {
    request_array:[],
    flag:[],
    userInfo:{},
    num:0,
    title:"",
    toast_msg: '已删除',
    hiddenToast: true,
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
    wx.request({
      url: config.host + '/info-get', 
      method: 'POST',
      data: {
        nickname: this.data.userInfo.nickName,
        path: this.data.userInfo.avatarUrl,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        that.setData({
          request_array:res.data 
        })
        // wx.navigateTo({
        //   url: "/pages/index/index" 
        // })
      }
    })
     for(var i=0;i<=len;i++)
        flag[i]=0
     this.setData({
       flag:flag
     });
     console.log(flag)

  },
  onShow:function(){
    this.onPullDownRefresh()
  },
  view:function(e){
    console.log(e)
    var index = e.currentTarget.id
    var data=this.data.request_array[index]
    wx.navigateTo({
      url: "../personal-view/personal-view?requestid=" +
       data.id+"&title="+data.title+"&des="+data.des+
       "&num="+data.num
    })
  },

  view_vote:function(e){
    console.log(e)
    var index = e.currentTarget.id
    var data = this.data.request_array[index]
    wx.navigateTo({
      url: "../result-vote/result-vote?requestid=" +data.id + "&title=" + data.title + "&des=" + data.des+"&num="+data.num
    })
  },
  edit:function () {
    wx.navigateTo({
      url: "../personal-edit/personal-edit?openid=11&&id=22"
    })
  },
  del: function (e) {
    var index = e.currentTarget.id
    var data = this.data.request_array[index]
    var that=this
    wx.request({
      url: config.host+'/item-del',
      method:'POST',
      data: {
        requestid: data.id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('delete')
        that.setData({
          hiddenToast: !that.data.hiddenToast
        })
        
      }
    })
  },
  onPullDownRefresh: function () {
     console.log("refresh")
     this.onLoad()
     wx.stopPullDownRefresh()
  },

  toastHidden: function () {
    console.log('hiden')
    this.setData({
      hiddenToast: true
    })
  this.onPullDownRefresh()
  },

  itemClick:function(event){
    var id = event.currentTarget.dataset.hi
    if  (flag[id]==1)
            flag[id]=0
    else{
      for(var i=0;i<len;i++){
        flag[i]=0
      }
      flag[id]=1;
    }
    this.setData({
      flag: flag
    })
  }
})
