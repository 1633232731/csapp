//app.js
App({
  register: function () {
    const db = wx.cloud.database();
    var that = this;

    db.collection('user').where({
      _openid: that.globalData.openid
    }).get().then(res => {
      if (res.data.length == 0) {
        console.log("数据库中无该用户记录");
        that.uploadOpenidToCloudDatabase()
      }
      else {
        console.log("已注册")
        that.globalData.userInfoID = res.data[0]._id
      }
    })
  },
  uploadOpenidToCloudDatabase: async function () {
    var that = this
    const db = wx.cloud.database()
    const count = await db.collection("count").doc("count").get()
    db.collection("user").add({
      data: {
        registerTime: new Date(),
        userID: count.data.user + 10000,
        userUploadProblem : [],
        nickname : "Anonymous",
        RGBAvatar : [],
        likeProblem : [],
        level : 0,  // 用户权限
        

      },
      success(res) {
        const _ = db.command
        db.collection('count').doc('count').update({
          data: {
            user: _.inc(1)
          }
        })
        that.globalData._id = res._id
        wx.showToast({
          title: '注册成功'
        })
      }
    })
  },
  onGetOpenid: function () {
    // 调用云函数
    var that = this;
    wx.cloud.callFunction({     //成功后检查是否注册
      name: 'login',
      data: {},
      success: res => {
        //console.log(res)
        console.log('[云函数] [login] user openid: ', res.result.openid)
        that.globalData.openid = res.result.openid
        that.register()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    this.onGetOpenid()
    this.globalData = {
      "openid": "",
      "userInfoID" : ""
    }
  }
})
