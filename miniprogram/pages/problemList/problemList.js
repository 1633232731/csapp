// miniprogram/pages/problemList/problemList.js


const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: 1,
    data: [],
    skip: 0,   // 自己发布skip
  },



  getMyLike: async function (params) {
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    var myLikeProblemID = await db.collection("user").doc(app.globalData.userInfoID).get()
    if (myLikeProblemID !== null || myLikeProblemID !== undefined) {
      var myLikeProblemIDList = myLikeProblemID.data.likeProblem
      var problemData = []
      for (let problem of myLikeProblemIDList) {
        var data = await db.collection("problem").where(_.and([
          {
            problemID: problem,
          }]).and(
          [
            _.or({
              publisher: app.globalData.openid
            }).or({
              publisher: _.neq(app.globalData.openid),
              showMyselfOnly : false
            }),
          ])
        ).get()
        if (data.data.length > 0) {
          problemData.push(data.data[0])
        }
        that.renderData(problemData)
      }
    } else {
      wx.showToast({
        title: '网路错误',
        icon: "error"
      })
    }
  },


  getMyPublish: async function (params) {
    var that = this
    const db = wx.cloud.database()
    var data = await db.collection("problem").where({
      publisher: app.globalData.openid
    })
      .skip(that.data.skip)
      .limit(10)
      .get()
    if (data.data.length > 0) {
      console.log(that.data)
      that.renderData(that.data.data.concat(data.data))
      that.data.skip += 10
    }
  },


  // getMysearch : function (searchKey) {
  //   var searchKey = searchKey
  // },





  renderData: function (dataArray) {
    console.log(dataArray)
    var that = this
    that.setData({
      data: dataArray
    })
  },

  navigateToDetail: function (e) {
    var problemNo = e.currentTarget.dataset.problemno
    wx.navigateTo({
      url: '../detail/detail?problemNo=' + problemNo,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * mode:
     * 1 : 我的发布
     * 2 ：我的收藏
     * 3 ：搜索
     */
    var that = this
    var mode = options.mode
    //var searchKey = options.searchKey
    that.setData({
      mode: mode
    })
    switch (mode) {
      case "1": {
        that.getMyPublish()
        break;
      }
      case "2": {
        that.getMyLike()
        break;
      }
      // case "3":{
      //   that.getMysearch(searchKey)
      // }
    }
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
    var that = this
    var mode = that.data.mode
    switch (mode) {
      case "2": {
        that.getMyLike()
        break;
      }
    }
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
    var that = this
    var mode = that.data.mode
    console.log(mode)
    switch (mode) {
      case "1": {
        that.getMyPublish()
        break;
      }
      case "2": {
        that.getMyLike()
        break;
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    var mode = that.data.mode
    switch (mode) {
      case "1": {
        that.getMyPublish()
        break;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})