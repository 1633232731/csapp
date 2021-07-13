// miniprogram/pages/upload/upload.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictureFilePaths: [], //里面存着所有图片

    pictureCount: 0, // == pictureFilePaths.length
    pictureColumn: 1,
    pictureShowHeight: 285,
    classification: "请选择",
    description: "",
    price: -1,
    title: "",
    showMyselfOnly : false,

    //标签选择器
    array: ['请选择', '课后作业', '突发奇想'],
    /*itemData :{"description" : "", "openid" : "", "date" : "", "time" : ""}*/
  },

  bindPickerChange: function (e) {
    var that = this
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      classification: that.data.array[e.detail.value]
    })
  },

  pictureDeteleInvalidFileCloud: function (e) {
    //用于处理失败的函数，删除云存储中的数据，数据库中的数据不需要管因为还没传到数据库
    console.log(222222222)
    console.log(e)
    var deletePath = e;
    console.log(deletePath)
    wx.cloud.deleteFile({
      fileList: deletePath,
      success: res => {
        console.log("文件删除成功")
      },
      fail: err => {
        console.log("文件删除失败")
      }
    })

  },

  checkPictureUpdateCloud : function () {
    var that = this
    wx.showModal({
      cancelColor: 'cancelColor',
      title: "确认",
      content: "确认提交？",
      success(res) {
        if (res.cancel) {
          return;
        } else if (res.confirm) {
          that.pictureUpdateCloud()
        }
      }
    })
  },

  pictureUpdateCloud: async function () {
    var that = this
    const db = wx.cloud.database()
    const _ = db.command
    var openid = app.globalData.openid;
    var date = new Date();
    var year = date.getFullYear();
    var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hour = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
    var minute = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var sencond = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    var timePath = year + '-' + month + '-' + day + '-' + hour + '-' + minute + '-' + sencond;
    var lastUpdateTime = year + '-' + month + '-' + day + " " + hour + ':' + minute + ':' + sencond;
    var timestamp = new Date().getTime()
    var tempItem = []
    const count = await db.collection("count").doc("count").get()
    db.collection('count').doc('count').update({
      data: {
        problem: _.inc(1)
      }
    })
    //传到数据库中的信息
    var itemData = {
      "lastUpdateTime": lastUpdateTime,
      "state": "open",
      "date": "",
      "time": "",
      "folderName": timePath,
      "classification": "",
      "title": "",
      "description": "",
      "pictureCount": that.data.pictureFilePaths.length,
      "fileId": [],
      "publisher": app.globalData.openid,
      "timestamp": timestamp,
      "problemID": count.data.problem,
      "like":0,
      "showMyselfOnly":false
    };
    itemData.date = year + '-' + month + '-' + day;
    itemData.time = hour + ':' + minute + ':' + sencond;
    itemData.description = that.data.description
    itemData.title = that.data.title
    itemData.classification = that.data.classification
    itemData.problemID = count.data.problem
    itemData.like = 0
    itemData.showMyselfOnly = that.data.showMyselfOnly
    console.log(itemData.date, " ", itemData.time)
    console.log(itemData.description)
    var IsUploadSuccessful = false;

    var uploadPictureRes
    var updateDataBaseRes
    var addDataBaseRes
    if (itemData.title == "") {
      wx.showToast({
        title: '标题很重要嗷ヾ(≧▽≦*)o',
        icon: 'none'
      })
      return;
    } 
    if (itemData.classification == "请选择") {
      wx.showToast({
        title: '分类是搜索依据哦≖‿≖✧',
        icon: 'none'
      })
      return;
    }
    // if (that.data.pictureFilePaths.length == 0) {
    //   //没图片有文字
    //   wx.showToast({
    //     title: '还没有选择图片呢o(*≧▽≦)',
    //     icon: 'none'
    //   })
    //   return;
    // }
    // if (itemData.description == "") {
    //   //没文字有图片
    //   wx.showToast({
    //     title: '描述一下问题啦(｡･∀･)ﾉﾞ',
    //     icon: 'none'
    //   })
    //   return;
    // }
    

    if (itemData.title != "") {
      wx.showLoading({
        title: '上传中',
      })

      for (let i = 0; i < that.data.pictureFilePaths.length; i++) {
        //路径里不需要 .jpg
        var tempCloudPath = 'courseShare/userUploadImage/' + openid + '/' + timePath + '/' + new Date().getTime() + "-" + Math.floor(Math.random() * 1000) + '.' + that.data.pictureFilePaths[i].match(/\.(\w+)$/)[1];
        uploadPictureRes = await wx.cloud.uploadFile({
          cloudPath: tempCloudPath, // 上传至云端的路径
          filePath: that.data.pictureFilePaths[i], // 小程序临时文件路径
        })
        itemData.fileId.push(uploadPictureRes.fileID) //添加到fileId中
        console.log(uploadPictureRes.fileID)
      }
      if (itemData.fileId.length == that.data.pictureFilePaths.length) {
        //当上传的数量和选择的数量一样的时候, 即全部上传成功

        //把全部记录赋值给数据库
        updateDataBaseRes = await db.collection('user').doc(app.globalData.userInfoID).update({
          data: {
            userUploadProblem: _.push(itemData.problemID)
          }
        })

        if (updateDataBaseRes.stats.updated == 1) { //成功更新的数量为1即正确
          console.log('[数据库] [更新发布记录] 成功：', updateDataBaseRes)

          addDataBaseRes = await db.collection("problem").add({
            data: {
              lastUpdateTime: itemData.lastUpdateTime,
              state: itemData.state,
              date: itemData.date,
              time: itemData.time,
              folderName: itemData.folderName,
              classification: itemData.classification,
              title: itemData.title,
              description: itemData.description,
              pictureCount: itemData.pictureCount,
              fileId: itemData.fileId,
              publisher: itemData.publisher,
              timestamp: itemData.timestamp,
              problemID : itemData.problemID,
              like : 0,
              showMyselfOnly : itemData.showMyselfOnly
            }
          })

          if (addDataBaseRes._id != "") {
            IsUploadSuccessful = true;
            wx.showToast({
              icon: 'success',
              title: '发布成功≖‿≖✧',
            })
            console.log('[数据库] [新增发布记录] 成功：', addDataBaseRes)
            that.clearInput()
            setTimeout(function () {
              //要延时执行的代码
              wx.navigateTo({
                url: '../detail/detail?problemNo=' + itemData.problemID,
              })
            }, 2000) //延迟时间
            //此时才算真正的上传成功，之前任意地方错都要删除存储中的信息
            //而数据库不需要动因为数据库数据还没被改变
          } else {
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
            console.error('[数据库] [新增发布记录] 失败：', addDataBaseRes)
            //更新数据库失败
            //isUploadSuccessful = false
            that.pictureDeteleInvalidFileCloud(itemData.fileId);
          }
        } else {
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          })
          console.error('[数据库] [更新发布记录] 失败：', updateDataBaseRes)
          //更新数据库失败
          //isUploadSuccessful = false
          that.pictureDeteleInvalidFileCloud(itemData.fileId);
        }

      } else {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
        console.error('图片上传失败：', uploadPictureRes)
        //更新数据库失败
        isUploadSuccessful = false
        that.pictureDeteleInvalidFileCloud(itemData.fileId);
      }

    } 
    else {
      console.log("0.0")
    }
  },

  clearInput : function (params) {
    var that = this
    that.setData({
      title: "",
      description: "",
      pictureColumn: 1,
      pictureShowHeight: 285,
      pictureFilePaths: [], //里面存着所有图片
      classification: "请选择",
    })
  },

  picturePreview: function (event) {
    var src = event.currentTarget.dataset.src; //获取data-src
    var imgList = event.currentTarget.dataset.list; //获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  pictureDatele: function (event) {
    var that = this;
    var image = that.data.pictureFilePaths;
    var index = event.currentTarget.dataset.index; //获取当前长按图片下标
    var column = 0;
    var height = 0;
    wx.showActionSheet({
      itemList: ['删除图片'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) { //删除图片
          wx.showModal({
            title: "删除图片",
            content: "确认要删除图片吗？",
            confirmColor: "",
            cancelColor: "#dddddd",
            success: function (res) {
              if (res.confirm) {
                console.log("确认删除")
                image.splice(index, 1);
                that.setData({
                  pictureFilePaths: image
                })
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                column = Math.ceil(that.data.pictureFilePaths.length / 3); //计算行数
                height = 30 * 2 + 225 * column + (column - 1) * 5 + 20; //20为冗余;
                that.setData({
                  pictureColumn: column,
                  pictureShowHeight: height
                })
              } else {
                wx.showToast({
                  title: '先不删啦(●´▽｀●) ',
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })

    /*console.log("image\n",image)
    console.log("pictureFilePaths\n",that.data.pictureFilePaths)*/
  },
  getPicture: function () {
    var that = this;
    var tempArray = that.data.pictureFilePaths.concat();
    var column = 0; //行数
    var height = 0; //高
    var leftChoose = 9 - that.data.pictureFilePaths.length; //还能选几张图片
    if (that.data.pictureFilePaths.length <= 9) {
      wx.showActionSheet({
        itemList: ['从手机相册选择', '拍照'],
        success: function (res) {
          console.log((res.tapIndex) == 0 ? '从手机相册选择' : '拍照')
          if (res.tapIndex == 0) { //从手机相册选择
            if (leftChoose != 0) {
              wx.chooseImage({
                count: leftChoose,
                sizeType: ['original', 'compressed'],
                sourceType: ['album'],
                success(res) {
                  // tempFilePath可以作为img标签的src属性显示图片
                  const tempFilePaths = res.tempFilePaths
                  for (let i = 0; i < tempFilePaths.length; i++)
                    tempArray.push(tempFilePaths[i])
                  that.setData({
                    pictureFilePaths: tempArray
                  })
                  console.log(tempFilePaths)

                  column = Math.ceil(that.data.pictureFilePaths.length / 3); //计算行数
                  height = 30 * 2 + 225 * column + (column - 1) * 5 + 20; //20为冗余;
                  that.setData({
                    pictureColumn: column,
                    pictureShowHeight: height
                  })
                  console.log(that.data.pictureColumn)

                }
              })
            } else {
              wx.showToast({
                title: '最多只能选9张图片嗷',
                icon: 'none'
              })
            }

          } else {
            if (leftChoose != 0) { //还不到九张
              wx.chooseImage({
                sizeType: ['original', 'compressed'],
                sourceType: ['camera'],
                success(res) {
                  // tempFilePath可以作为img标签的src属性显示图片
                  const tempFilePaths = res.tempFilePaths
                  for (let i = 0; i < tempFilePaths.length; i++)
                    tempArray.push(tempFilePaths[i])
                  that.setData({
                    pictureFilePaths: tempArray
                  })
                  console.log(tempFilePaths)

                  column = Math.ceil(that.data.pictureFilePaths.length / 3); //计算行数
                  height = 30 * 2 + 225 * column + (column - 1) * 5 + 20; //20为冗余
                  that.setData({
                    pictureColumn: column,
                    pictureShowHeight: height
                  })
                  console.log(that.data.pictureColumn)
                }
              })
            } else {
              wx.showToast({
                title: '最多只能选9张图片嗷',
                icon: 'none'
              })
            }

          }

        },
        fail: function (res) {
          console.log(res.errMsg)
          wx.showToast({
            title: '取消选择',
            icon: "none"
          })
        }
      })
    } else {
      wx.showToast({
        title: '最多选9个嗷',
        icon: "none"
      })
    }


  },

  bindInputDescription: function (e) {
    var that = this;
    that.data.description = e.detail.value
  },
  bindInputTitle: function (e) {
    var that = this;
    that.data.title = e.detail.value
  },



  switchChange : function (event) {
    var that = this
    that.setData({
      showMyselfOnly : event.detail.value
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