var util = require('../../utils/util.js');
var config=require('../../config.js');
var date_select;
var time_select;
var list_item=[1,1];
var count=2;
var flag =[1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
var start_date = util.formatDate(new Date());
var start_time = util.formatTime(new Date());
var app=getApp()
Page({
  data: {
    icon_remove:"/pages/images/remove.png",
    icon_add: "/pages/images/additem.png",
    showTopTips: false,
    date:start_date,
    time:start_time,
    date_select:start_date,
    time_select:start_time,
    isAgree: false,
    flag:flag,
    userInfo:{},
  },
  onShow: function () {
    flag = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    this.setData({
      flag: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
     date_select:date_select,
     time_select:time_select});
     
  },
  onLoad:function(){
    var that=this
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  addItem: function () {
    count++
    console.log(count)
    for(var i=0;i<10;i++){
      if (flag[i]==0){
        flag[i]=1
        break
      }
    }
    this.setData({
      flag:flag
    });
  },
  
  delItem: function (e) {
    if (count<=1)
      return
    count--
    flag[e.currentTarget.id]=0
    this.setData({
      flag: flag
    });
  },

  addPicItem:function(){
    count++
    console.log(count)
    for (var i = 0; i < 10; i++) {
      if (flag[i] == 0) {
        flag[i] = 2
        break
      }
    }
    this.setData({
      flag: flag
    });
  },

  trim:function (str) {
    str = str.replace(/^\s+|\s+$/g, "");
    return str
  },

  formSubmit: function (e) {
    var data = e.detail.value
    var msg=''
    var that = this
    console.log(data)
    var collect = ""
    var tmp=''
    var collect_pic = ""
    var tmp_pic = ''
    var count = 0
    var deadline = data.date_select + " " + data.time_select
    for (var i = 0; i < 10; i++) {
      if (data["" + i]) {
        if (flag[i] == 0)
          continue
        collect = collect + data["" + i] + ";"
        tmp = tmp + data["" + i]
      }
    }


    for (var i = 0; i < 10; i++) {
      if (data[i+'pic']) {
        if (flag[i] == 0)
          continue
        collect_pic = collect_pic + data[i+'pic'] + ";"
        tmp_pic = tmp_pic + data[i+'pic']
      }
    }

    var user = getApp().globalData.userInfo
    var pic_exist=false;
    var tmp_exist=false;
    for(var i=0;i<10;i++){
      if (flag[i]==1){
        tmp_exist=true
      } else if (flag[i] == 2){
        pic_exist = true
      }
    }
    if (data.title==null||this.trim(data.title).length==0)
        msg='标题不能为空'
    if(tmp_exist)
        if (tmp == null || this.trim(tmp).length == 0)
        msg = '收集项不能为空'

    if(pic_exist)
        if (tmp_pic == null || this.trim(tmp_pic).length == 0)
         msg = '图片项不能为空'
    
    if(msg!=''){
        wx.showModal({
          title: '提示',
          showCancel:false,
          content: msg,
          success:function(res){
            if(res.confirm){
              console.log('confirm')
              return;
            }
          }
        })
    }
    else{
        wx.request({
          url: config.host + '/info-collect',
          method: 'POST',
          data: {
            openid: "",
            nickname: that.data.userInfo.nickName,
            path: that.data.userInfo.avatarUrl,
            title: data.title,
            des: data.des,
            collect: collect,//用分号分割
            deadline: data.time_select + data.date_select,
            collect_pic:collect_pic,
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            var id = res.data
            console.log(id)
            wx.navigateTo({
              url: "../view-info/view-info?" +
              "&title=" + data.title + "&des=" + data.des + "&count=" + count +
              "&info=" + collect + "&time=" + data.time_select + "&date=" + data.date_select + "&id="+id+"&pic="+collect_pic
            })
          }
        })
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
    },
    
});  