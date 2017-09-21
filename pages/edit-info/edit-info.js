// edit-info.js
var config = require('../../config.js');
var app=getApp();
const date = new Date()
const hours = []


for (let i =0; i <= 12; i++) {
  hours.push(i)
}


Page({
  /**
   * 页面的初始数据
   */

  data: {
    id: "",
    title: "",
    des: "",
    info_array: [],
    time: "",
    date: "",
    pri: "",
    userInfo: {},
    hiddenToast: true,
    toast_msg:'已提交',
    files:[],
    showModalStatus: false,
    hours: hours,
    hour: 1,
    value: [1],
    openid:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    var user = wx.getStorageSync('user') || {};
    if (!user.openid || (user.expires_in || Date.now()) < (Date.now() + 600)) {
      wx.login({
        success: function (res) {
          var d = app.globalData.wxData;
          var l = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + d.appid + '&secret=' + d.secret + '&js_code=' + res.code + '&grant_type=authorization_code';
          wx.request({
            url: l,
            data: {},
            method: 'GET', 
            success: function (res) {
              console.log(res)
              var obj = {};
              obj.openid = res.data.openid;
              obj.expires_in = Date.now() + res.data.expires_in;
              wx.setStorageSync('user', obj);
              that.setData({
                openid: obj.openid
              })
            }
          });
        }
      });
    } else {
      console.log(user);
    }  
    var info =options.info
    var info_array = options.info.split(";")
    var pic_array=options.pic.split(";")
    info_array.pop()
    pic_array.pop()
    var that=this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        id: options.id,
        title: options.title,
        des: options.des,
        info_array: info_array,
        pic_array:pic_array,
        pic:options.pic,
        time: options.time,
        date: options.date,
        info:info,
      })
    })
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;
    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();
    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    })
    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({
        animationData: animation
      })
      //关闭  
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  mention:function(e){
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      hour: this.data.hours[val[0]],
    })
  },
  
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
    console.log(this.data.files)
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  /**
   *    toast显示时间到时处理业务 
   */
  toastHidden: function () {
    this.setData({
      hiddenToast: true
    })
  },

  formSubmit: function (e) {
    var data_input = e.detail.value
    console.log(data_input)
    var that = this
    if (wx.getStorageSync(that.data.id) == 1)    {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '你已经提交过了',
      })
      return
    }
    var collect = ""
    for (var i = 0; i < 10; i++) {
      if (data_input["" + i]) {
        collect = collect + data_input["" + i] + ";"
      }
    }
    var files=this.data.files
    var pic=""
    for(var i=0;i<files.length;i++){
        pic=pic+i+'.'+files[i].split('.')[1]+";"
    }
    wx.request({
      url: config.host+'/info',
      method: 'POST',
      data: {
          openid: "",
          id:this.data.id,
          nickname: this.data.userInfo.nickName,
          path: this.data.userInfo.avatarUrl,
          title: data_input.title,
          des: data_input.des,
          collect: collect,//用分号分割
          pri: data_input.pri,
          pic:pic,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('success')
        that.upload(0)
        that.setData({
          hiddenToast: !that.data.hiddenToast
        })
        wx.setStorageSync(that.data.id,1);
        // console.log('success')
        // that.setData({
        //   hiddenToast: !that.data.hiddenToast
        // })
      }
    })
  },
  submit_mention:function(e){
    //test 
    var that = this
    if(wx.getStorageSync(that.data.id+'-1')==-1){
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '你已经提交过了',
        })
        return 
    }
    var add=0
    if(e.detail.value.hour=='0')
        add=4*60//e.detail.value
    else
      add =parseInt(e.detail.value.hour)*60*60
    
    var timestamp = parseInt((Date.parse(new Date())+"").substring(0,10))+add
    console.log('timestamp'+timestamp)
    var url = "/pages/edit-info/edit-info?" + "id=" + this.data.id + "&title=" + this.data.title + "&des=" + this.data.des + "&info=" + this.data.info + "&time=" + this.data.time + "&date=" + this.data.date + "&pic=" + this.data.pic
    wx.request({
      url: config.host +'/push-service',
      data: {
        openid: that.data.openid,
        formid: e.detail.formId,
        pushtime:timestamp,
        url:url,
        deadline:that.data.date+" "+that.data.time,
        title:that.data.title,
        nickname:that.data.userInfo.nickName,
      },
      method: 'POST',
      success: function (res) {
        that.setData({
          hiddenToast: !that.data.hiddenToast
          
        })
        wx.setStorageSync(that.data.id+'-1', -1);
        console.log("push msg");
        console.log(res);
      },
      fail: function (err) {
        // fail  
        console.log("push err")
        console.log(err);
      }
    });  
  },
 upload:function(i) {
    var that=this
    if (i == this.data.files.length) {
      return;
    }
    wx.uploadFile({
      url: config.host +'/upload-file',
      filePath: that.data.files[i],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        nickname: that.data.userInfo.nickName,
        requestid:that.data.id,
        i:i,
      },
      success: function (res) {
        
        console.log("success:" + i);
        i++
        if (i == that.data.files.length) {
          return;
        }
        else{
        that.upload(i++);
        }
      },
      fail: function (e) {
        console.log("fail:" + i);
        console.log(e);
      },
      complete: function () {
        console.log("complete:" + i);
      }
    })
  },
 toastHidden: function () {
   console.log('hiden')
   this.setData({
     hiddenToast: true
   })
  //  this.onPullDownRefresh()
 },
})