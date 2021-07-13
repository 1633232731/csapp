// miniprogram/pages/searchResultList/searchResultList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: "",
    searchIndex: 0,
    items: [
      { value: '1', name: '标题搜索', checked: 'true' },
      { value: '2', name: '内容搜索' },
      { value: '3', name: '作者搜索' },
      { value: '4', name: '问题ID搜索' },
    ],
    radioValue: "1",
    data: [],
    isloaded: true // 用于控制滑动文字显示
  },

  makeHintDisappear: function (params) {
    // 用于控制滑动文字消失，在每次失败或无结果后调用
    var that = this
    that.setData({
      isloaded: true
    })
  },



  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }
    this.setData({
      items
    })
    this.setData({
      radioValue: e.detail.value
    })
  },
  getSearchText: function (e) {
    var that = this
    that.setData({
      searchText: e.detail.value
    })
  },

  getSearchResultButton: function (searchText) {
    var searchText = searchText
    var that = this
    console.log(that.data.searchText)
    if (that.data.searchText === "" || that.data.searchText === undefined) {
      wx.showToast({
        title: '请输入搜索字段',
        icon: "none"
      })
      return;
    }
    that.setData({
      isloaded: false
    })
    switch (that.data.radioValue) {
      case "1": {
        that.getSearchResultByTitle()
        break
      }
      case "2": {
        that.getSearchResultByContent()
        break
      }
      case "3": {
        that.getSearchResultByAuthor()
        break
      }
      case "4": {
        that.getSearchResultByProblemID()
        break
      }
    }
  },



  getSearchResultByTitle: function () {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    db.collection('problem').where({
      title: db.RegExp({
        regexp: (that.data.searchText) + "+",
        options: 'i',
      }),
      showMyselfOnly: false
    }).get()
      .then(res => {
        console.log(res)
        problemDetail = res.data
        if (problemDetail.length === 0) {
          wx.showToast({
            title: '无结果',
            icon: "none"
          })
          that.makeHintDisappear()
        }
        that.renderData(problemDetail)
        that.setData({
          chooseCategoryIndex: 1,
        })
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '搜索失败',
          icon: "error"
        })
        that.makeHintDisappear()
      })

  },

  getSearchResultByContent: function (params) {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    db.collection('problem').where({
      description: db.RegExp({
        regexp: (that.data.searchText) + "+",
        options: 'i',
      }),
      showMyselfOnly: false,
    }).get()
      .then(res => {
        console.log(res)
        problemDetail = res.data
        if (problemDetail.length === 0) {
          wx.showToast({
            title: '无结果',
            icon: "none"
          })
          that.makeHintDisappear()
        }
        that.renderData(problemDetail)
        that.setData({
          chooseCategoryIndex: 1,
        })
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '搜索失败',
          icon: "error"
        })
        that.makeHintDisappear()
      })
  },


  getSearchResultByAuthor: async function (params) {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    var userInfo = await db.collection("user").where({
      nickname: that.data.searchText
    }).get()
    console.log(userInfo.data)
    var userOpenid = ""   // 查询人的openid
    if (userInfo.data.length <= 0) {
      wx.showToast({
        title: '查无此人',
        icon: "error"
      })
      that.makeHintDisappear()
      return;
    } else {
      userOpenid = userInfo.data[0]._openid
    }
    db.collection('problem').where({
      publisher: userOpenid,
      showMyselfOnly: false,
    }).get()
      .then(res => {
        console.log(res)
        problemDetail = res.data
        if (problemDetail.length === 0) {
          wx.showToast({
            title: '无结果',
            icon: "none"
          })
          that.makeHintDisappear()
        }
        that.renderData(problemDetail)
        that.setData({
          chooseCategoryIndex: 1,
        })
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '搜索失败',
          icon: "error"
        })
        that.makeHintDisappear()
      })
  },


  getSearchResultByProblemID: function (params) {
    var that = this;
    const db = wx.cloud.database()
    var problemDetail = []
    if (isNaN(parseInt(that.data.searchText))) {
      wx.showToast({
        title: '请输入数字搜索',
        icon: "error"
      })
      that.makeHintDisappear()
      return;
    }

    db.collection('problem').where({
      problemID: parseInt(that.data.searchText),
      showMyselfOnly: false,
    }).get()
      .then(res => {
        console.log(res)
        problemDetail = res.data
        if (problemDetail.length === 0) {
          wx.showToast({
            title: '无结果或作者隐藏',
            icon: "none"
          })
          that.makeHintDisappear()
        }
        that.renderData(problemDetail)
        that.setData({
          chooseCategoryIndex: 1,
        })
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '搜索失败',
          icon: "error"
        })
        that.makeHintDisappear()
      })
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
    for (let i of data) {
      let nickname = await db.collection("user").where({
        _openid: i.publisher
      }).get()
      if (nickname.data.length > 0) {
        i.authorNickname = nickname.data[0].nickname
      } else {
        i.authorNickname = "anonymous"
      }
    }
    that.setData({
      data: data
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
    var searchText = options.searchKey
    var that = this
    that.setData({
      searchText: searchText
    })
    if (searchText !== "") {
      that.getSearchResultByTitle()
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