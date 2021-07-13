// miniprogram/pages/index/detail/detail.js
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    problemNo: 0,
    problemDetail: {},
    isLike: false,
    myComment: "",
    commentList: [],
    showMyselfOnly: false,
    displaySwitch: false,
    collect: false,
  },


  renderData: async function (data) {
    var that = this
    const db = wx.cloud.database()
    // 发布者的个人信息
    var userInfo = await db.collection("user").where({
      _openid: data.publisher
    }).get()
    if (userInfo.data.length > 0) {
      data.authorNickname = userInfo.data[0].nickname
      data.RGBAvatar = userInfo.data[0].RGBAvatar
    } else {
      data.authorNickname = "anonymous"
      data.RGBAvatar = [0, 0, 0]
    }
    var displaySwitch = false
    if (data._openid === app.globalData.openid) {
      displaySwitch = true
    } else {
      displaySwitch = false
    }
    var collect = false
    var myUserInfo = await db.collection("user").doc(app.globalData.userInfoID).get()
    //console.log(myUserInfo.data.likeProblem)
    if (myUserInfo.data.likeProblem.indexOf(that.data.problemNo) === -1) {
      // 收藏列表中没有
      collect = false
    } else {
      collect = true
    }
    that.setData({
      problemDetail: data,
      showMyselfOnly: data.showMyselfOnly,
      displaySwitch: displaySwitch,
      collect: collect
    })
    console.log(that.data.problemDetail)
  },

  getDetail: async function () {
    var that = this
    const db = wx.cloud.database()
    var problemDetail = await db.collection("problem").where({
      problemID: that.data.problemNo
    }).get()
    console.log(problemDetail)
    if (problemDetail.data.length > 0) {
      that.renderData(problemDetail.data[0])
    } else {
      wx.showToast({
        title: '获取详情失败',
        icon: "error"
      })
    }
  },

  previewImage: function (event) {
    var that = this
    var src = event.currentTarget.dataset.src; //获取data-src
    var imgList = that.data.problemDetail.fileId; //获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  getComment: async function (params) {
    var that = this
    const db = wx.cloud.database()
    var allComment = await db.collection("comment").where({
      problemID: that.data.problemNo
    }).get()
    if (allComment.data.length > 0) {
      var comment = allComment.data
      // 根据点赞数排序
      comment.sort(function (a, b) {
        return b.like - a.like
      })
      // 根据评论的openid查一下user的nickname
      for (let i of comment) {
        let userInfo = await db.collection("user").where({
          _openid: i.commentUser
        }).get()
        if (userInfo.data.length > 0) {
          i.commentNickname = userInfo.data[0].nickname
          i.commentRGBAvatar = userInfo.data[0].RGBAvatar
        } else {
          i.commentNickname = "anonymous"
          i.commentRGBAvatar = [0, 0, 0]
        }
        i.time = that.formatDate(i.time)
        i.isLike = false
      }
      that.setData({
        commentList: comment
      })

    } else {

    }
  },


  formatDate: function (date) {
    var date = new Date(date);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return YY + MM + DD + " " + hh + mm + ss;
  },


  commentLike: function (e) {
    var likeIndex = e.currentTarget.dataset.index
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    var commentID = that.data.commentList[likeIndex]._id
    var allComment = that.data.commentList
    db.collection("comment").doc(commentID).update({
      data: {
        like: _.inc(1)
      }
    }).then(res => {
      wx.showToast({
        title: '点赞成功',
      })
      allComment[likeIndex].isLike = true
      allComment[likeIndex].like += 1
      that.setData({
        commentList: allComment
      })
    }
    ).catch(err => {
      wx.showToast({
        title: '点赞失败',
      })
    })


  },

  getMyComment: function (e) {
    var that = this
    that.setData({
      myComment: e.detail.value
    })
  },

  checkComment: function (e) {
    var that = this
    wx.showModal({
      cancelColor: 'cancelColor',
      title: "确认",
      content: "确认提交？",
      success(res) {
        if (res.cancel) {
          return;
        } else if (res.confirm) {
          that.sendComment(e)
        }
      }
    })
  },

  sendComment: function (e) {
    var that = this
    const db = wx.cloud.database()
    if (that.data.myComment === "") {
      wx.showToast({
        title: '还没有写评论哦',
      })
      return;
    }
    else {
      db.collection("comment").add({
        data: {
          time: new Date().getTime(),
          commentContent: that.data.myComment,
          problemID: that.data.problemNo,
          commentUser: app.globalData.openid,
          like: 0,
          weight: 0,
        }
      }).then(res => {
        console.log(res)
        wx.showToast({
          title: '评论成功',
        })
        that.setData({
          myComment: ""
        })
        that.getComment()
      })
        .catch(console.error)
    }
  },


  tapLike: function () {
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    db.collection("problem").where({
      problemID: that.data.problemNo
    }).update({
      data: {
        like: _.inc(1)
      },
    }).then(res => {
      wx.showToast({
        title: '点赞成功',
      })
      that.setData({
        isLike: true
      })
    }
    ).catch(err => {
      wx.showToast({
        title: '点赞失败',
      })
    })
  },



  switchChange: function (event) {
    var that = this
    const db = wx.cloud.database()
    that.setData({
      showMyselfOnly: event.detail.value
    })
    db.collection("problem").where({
      problemID: that.data.problemNo
    }).update({
      data: {
        showMyselfOnly: event.detail.value
      }
    }).then(res => {
      wx.showToast({
        title: '修改成功',
        icon: "success"
      })
    }).catch(err => {
      wx.showToast({
        title: '修改失败',
        icon: "error"
      })
      console.log(err)
    })
  },

  collectProblem: function (params) {
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    // 可以收藏自己的文章
    db.collection('user').doc(app.globalData.userInfoID).update({
      data: {
        likeProblem: _.push([that.data.problemNo])
      }
    }).then(res => {
      that.setData({
        collect: true
      })
      wx.showToast({
        title: '收藏成功',
      })
    }).catch(err => {
      wx.showToast({
        title: '收藏失败',
      })
    })
  },

  cancelCollectProblem: function (params) {
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user').doc(app.globalData.userInfoID).update({
      data: {
        likeProblem: _.pullAll([that.data.problemNo])
      }
    }).then(res => {
      that.setData({
        collect: false
      })
      wx.showToast({
        title: '取消成功',
      })
    }).catch(err => {
      wx.showToast({
        title: '取消失败',
      })
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var problemNo = parseInt(options.problemNo)
    var that = this
    that.setData({
      problemNo: problemNo
    })
    that.getDetail()
    that.getComment()
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