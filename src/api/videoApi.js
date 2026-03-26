// 模拟视频列表数据（可自行扩展）
export const getVideoFeed = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: [
          {
            id: 1,
            video_url: 'https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/newPage/Interactive/newhomevideo.mp4', // 测试视频地址
            cover_url: 'https://picsum.photos/720/1280?random=1',
            description: '测试视频1 - 垂直滑动播放效果',
            is_liked: false,
            like_count: 128,
            comment_count: 23,
            share_count: 15,
            is_followed: false,
            author: {
              id: 1001,
              nickname: '测试作者1',
              avatar: 'https://p3-passport.byteacctimg.com/img/user-avatar/899d539d8098911151e89575e998060d~300x300.image'
            }
          },
          {
            id: 2,
            video_url: 'https://sxd-tx-1315371622.cos.ap-nanjing.myqcloud.com/newPage/Interactive/newhomevideo.mp4',
            cover_url: 'https://picsum.photos/720/1280?random=2',
            description: '测试视频2 - 双击点赞+评论功能',
            is_liked: false,
            like_count: 89,
            comment_count: 11,
            share_count: 8,
            is_followed: false,
            author: {
              id: 1002,
              nickname: '测试作者2',
              avatar: 'https://p9-passport.byteacctimg.com/img/user-avatar/7a079f50178009935900a05095008c63~300x300.image'
            }
          },
          {
            id: 3,
            video_url: 'https://www.scmuseum.cn/file/e79606ddbcfc11eba00c7020840b69ac/CMS/UEDITOR/AECHIVES/20260114/b3db8699ee5e4c07b6800063f8b1f3fd.mp4',
            cover_url: 'https://picsum.photos/720/1280?random=3',
            description: '测试视频2 - 双击点赞+评论功能',
            is_liked: false,
            like_count: 89,
            comment_count: 11,
            share_count: 8,
            is_followed: false,
            author: {
              id: 1002,
              nickname: '测试作者2',
              avatar: 'https://p9-passport.byteacctimg.com/img/user-avatar/7a079f50178009935900a05095008c63~300x300.image'
            }
          },{
            id: 4,
            video_url: 'https://www.scmuseum.cn/file/e79606ddbcfc11eba00c7020840b69ac/CMS/UEDITOR/AECHIVES/20260114/b3db8699ee5e4c07b6800063f8b1f3fd.mp4',
            cover_url: 'https://picsum.photos/720/1280?random=4',
            description: '测试视频2 - 双击点赞+评论功能',
            is_liked: false,
            like_count: 89,
            comment_count: 11,
            share_count: 8,
            is_followed: false,
            author: {
              id: 1002,
              nickname: '测试作者2',
              avatar: 'https://p9-passport.byteacctimg.com/img/user-avatar/7a079f50178009935900a05095008c63~300x300.image'
            }
          },
        ]
      })
    }, 300)
  })
}

// 模拟点赞接口
export const likeVideo = (_videoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}

// 模拟关注接口
export const followUser = (_userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}

// 模拟取消关注接口
export const unfollowUser = (_userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}

// 其他接口（likeVideo、getVideoFeed 等）保持不变

// 获取视频评论列表
export const getVideoComments = async (_videoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: [
          {
            id: 1,
            avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
            nickname: '小番茄',
            content: '这个视频太好看了！',
            create_time: new Date(Date.now() - 3600000 * 2).toISOString(),
            is_liked: false,
            like_count: 10
          },
          {
            id: 2,
            avatar: 'https://img.yzcdn.cn/vant/dog.jpeg',
            nickname: '程序员小张',
            content: '支持博主！',
            create_time: new Date(Date.now() - 86400000 * 1).toISOString(),
            is_liked: false,
            like_count: 5
          }
        ]
      })
    }, 500)
  })
}

// 发布视频评论
export const addVideoComment = async (_params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 0, msg: '评论成功' })
    }, 500)
  })
}
// 模拟评论点赞接口
export const likeComment = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}
