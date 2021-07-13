// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImage: ["images/1.png"],
    category: ["热榜", "最近"],
    chooseCategoryIndex:0,
    data : [],
    searchText:"",
  },
  chooseCategory : function (e) {
    var index = e.currentTarget.dataset.index
    var that = this
    that.setData({
      chooseCategoryIndex : index,
      data : []
    })
    if(index === 0){
      that.getHottestProblem()
    } else if(index === 1){
      //that.getSearchProblem()
      that.getRecentProblem()
    } else if(index === 2){
      that.getRecentProblem()
    }
  },

  getRecentProblem : function (params) {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    db.collection('problem').where({
      showMyselfOnly:false
    })
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get()
    .then(res =>{
      console.log(res)
      problemDetail = res.data
      that.renderData(problemDetail)
      that.setData({
        chooseCategoryIndex : 2,
      })
    })
    .catch(err=>{
      console.log(err)
      wx.showToast({
        title: '获取最近失败',
        icon:"error"
      })

    })



  },
  navigateToSearchPage : function (params) {
    var that = this
    wx.navigateTo({
      url: '../searchResultList/searchResultList?searchKey=' + that.data.searchText,
    })
  },
  getSearch : function (e) {
    var that = this
    that.setData({
      searchText : e.detail.value
    })
  },

  getSearchProblem : function () {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    if(that.data.searchText === ""){
      wx.showToast({
        title: '请输入搜索字段',
        icon:"none"
      })
    }
    db.collection('problem').where({
      title: db.RegExp({
        regexp: (that.data.searchText) + "+",
        options: 'i',
      }),
      showMyselfOnly:false
    }).get()
      .then(res=>{
        console.log(res)
        problemDetail = res.data
        if(problemDetail.length === 0){
          wx.showToast({
            title: '无结果',
            icon:"none"
          })
        }
        that.renderData(problemDetail)
        that.setData({
          chooseCategoryIndex : 1,
        })
    }).catch(err =>{
      console.log(err)
      wx.showToast({
        title: '搜索失败',
        icon:"error"
      })
    })

  },
  getHottestProblem: async function (params) {
    /**
     * 获取热榜问题，热榜获取时个人设置不可见失效
     */
    var that = this;
    const db = wx.cloud.database()
    var data = await db.collection("hottest").doc("1").get()
    if(data == undefined || data == null){
      wx.showToast({
        title: '网络错误',
        icon:"error"
      })
      return ;
    }
    // 人为控制热门
    var problemArray = data.data.problemID
    console.log(problemArray)
    var problemDetail = []
    for(let i = 0;i<problemArray.length;i++){
      let problem = await db.collection("problem").where({
        problemID : problemArray[i]
      }).get()
      if(problem.data.length > 0){
        problemDetail.push(problem.data[0])
      }
    }
    that.renderData(problemDetail)
  },

  /**
   * 
   * @param {array} data 
   * 在函数中可以修饰变量
   * 统一渲染接口
   */
  renderData: async function (data) {
    var that = this;
    const db = wx.cloud.database()
    console.log(data)
    var that = this
    for(let i of data){
      let nickname = await db.collection("user").where({
        _openid:i.publisher
      }).get()
      if(nickname.data.length > 0){
        i.authorNickname = nickname.data[0].nickname
      } else {
        i.authorNickname = "anonymous"
      }
    }
    that.setData({
      data : data
    })
  },



  navigateToDetail : function (e) {
    
    var problemNo = e.currentTarget.dataset.problemno
    wx.navigateTo({
      url: '../detail/detail?problemNo=' + problemNo,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
  
    that.getHottestProblem()
    wx.showLoading({
      title: '加载中',
      mask : true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
    
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
    /**
     * 为了让用户看到自己最新的发布，其实有点蠢，浪费查询资源
     */
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    that.setData({
      data : []
    })
    if(that.data.chooseCategoryIndex === 0){
      that.getHottestProblem()
    } else if(that.data.chooseCategoryIndex === 1){
      //that.getSearchProblem()
      that.getRecentProblem()
    } else if(that.data.chooseCategoryIndex === 2){
      that.getRecentProblem()
    }
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
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