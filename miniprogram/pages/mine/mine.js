// miniprogram/pages/mine/mine.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputNickname: "",
    RGBAvatar: [0, 0, 0],
    countEasterEgg: 0
  },

  getInputNickname: function (e) {
    var that = this
    var nickname = e.detail.value
    that.setData({
      inputNickname: nickname
    })


  },

  checkSubmit: function () {
    var that = this
    if (that.data.inputNickname == "") {
      wx.showToast({
        title: '昵称不能为空',
        icon: "error"
      })
      return;
    }
    wx.showModal({
      cancelColor: 'cancelColor',
      title: "确认",
      content: "确认提交？",
      success(res) {
        if (res.cancel) {
          return;
        } else if (res.confirm) {
          that.submitNickname()
        }
      }
    })
  },

  submitNickname: function () {
    var that = this
    const db = wx.cloud.database()
    var userInfoID = app.globalData.userInfoID
    console.log(userInfoID)
    db.collection("user").doc(userInfoID).update({
      data: {
        nickname: that.data.inputNickname
      }
    }).then(res => {
      wx.showToast({
        title: '修改成功',
      })
      that.setData({
        inputNickname: ""
      })
    }).catch(err => {
      wx.showToast({
        title: '修改失败',
        icon: "error"
      })
    })
  },

  getRed: function (e) {
    var that = this
    var color = that.data.RGBAvatar
    if (e.detail.value === "") {
      color[0] = 0
    } else {
      color[0] = parseInt(e.detail.value)
    }
    that.setData({
      RGBAvatar: color
    })
  },

  getGreen: function (e) {
    var that = this
    var color = that.data.RGBAvatar
    if (e.detail.value === "") {
      color[1] = 0
    } else {
      color[1] = parseInt(e.detail.value)
    }
    that.setData({
      RGBAvatar: color
    })
  },

  getBlue: function (e) {
    var that = this
    var color = that.data.RGBAvatar
    if (e.detail.value === "") {
      color[2] = 0
    } else {
      color[2] = parseInt(e.detail.value)
    }
    that.setData({
      RGBAvatar: color
    })
  },

  checkAvatar: function (params) {
    var that = this
    if (that.data.RGBAvatar[0] > 255 || that.data.RGBAvatar[1] > 255 || that.data.RGBAvatar[2] > 255) {
      wx.showToast({
        title: '取值应为0~255',
        icon: "error"
      })
      return;
    }
    wx.showModal({
      cancelColor: 'cancelColor',
      title: "确认",
      content: "确认提交？",
      success(res) {
        if (res.cancel) {
          return;
        } else if (res.confirm) {
          that.submitAvatar()
        }
      }
    })
  },

  submitAvatar: function (params) {
    var that = this
    const db = wx.cloud.database()
    var userInfoID = app.globalData.userInfoID
    console.log(userInfoID)
    db.collection("user").doc(userInfoID).update({
      data: {
        RGBAvatar: that.data.RGBAvatar
      }
    }).then(res => {
      wx.showToast({
        title: '修改成功',
      })
      that.setData({
        RGBAvatar: [0, 0, 0]
      })
    }).catch(err => {
      wx.showToast({
        title: '修改失败',
        icon: "error"
      })
    })
  },

  previewAvatar: async function (params) {
    var that = this
    // const db = wx.cloud.database()
    // var a = await db.collection("problem").where({
    //   date :"2021-06-14"
    // }).set({
    //   data :{
    //     showMyselfOnly : false
    //   }
    // })
    // console.log(a)

    that.data.countEasterEgg += 1
    if (that.data.countEasterEgg === 1) {
      wx.showToast({
        title: '别按了，没啥用',
        icon: "none"
      })
    } else if(that.data.countEasterEgg>=2 && that.data.countEasterEgg <=6){
      wx.showToast({
        title: '真的没啥用',
        icon: "none"
      })
    } else{
      wx.showToast({
        title: 'Powered by ZXC ',
        icon: "none"
      })
    }

  },


  navigateToMyPublish :function (params) {
    wx.navigateTo({
      url: '../problemList/problemList?mode=1',
    })
  },

  navigateToMyLike : function (params) {
    wx.navigateTo({
      url: '../problemList/problemList?mode=2',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})