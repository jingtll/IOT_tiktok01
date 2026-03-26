// 模拟API函数，用于模拟后端响应

// 存储键名
const FOLLOW_STATUS_KEY = 'mock_follow_status'
const COMMENTS_KEY = 'mock_comments'
const AUTHORS_KEY = 'mock_authors'
const WORKS_KEY = 'mock_works'
const VIDEOS_KEY = 'mock_videos'

// 获取所有关注状态，key是作者ID，value是是否关注
export const getFollowStatus = () => {
  try {
    const status = localStorage.getItem(FOLLOW_STATUS_KEY)
    return status ? JSON.parse(status) : {}
  } catch (error) {
    console.error('获取关注状态失败:', error)
    return {}
  }
}

// 获取指定作者的关注状态，返回是否已关注
export const getAuthorFollowStatus = (authorId) => {
  const status = getFollowStatus()
  return status[authorId] || false
}

// 设置作者的关注状态，返回操作是否成功
export const setAuthorFollowStatus = (authorId, isFollowed) => {
  try {
    const status = getFollowStatus()
    status[authorId] = isFollowed
    localStorage.setItem(FOLLOW_STATUS_KEY, JSON.stringify(status))
    return true
  } catch (error) {
    console.error('设置关注状态失败:', error)
    return false
  }
}

// 切换作者的关注状态，返回新关注状态
export const toggleAuthorFollowStatus = (authorId) => {
  const currentStatus = getAuthorFollowStatus(authorId)
  const newStatus = !currentStatus
  setAuthorFollowStatus(authorId, newStatus)
  return newStatus
}

// 清除所有关注状态，返回操作是否成功
export const clearFollowStatus = () => {
  try {
    localStorage.removeItem(FOLLOW_STATUS_KEY)
    return true
  } catch (error) {
    console.error('清除关注状态失败:', error)
    return false
  }
}

// 获取所有评论，key是视频ID，value是评论数组
export const getComments = () => {
  try {
    const comments = localStorage.getItem(COMMENTS_KEY)
    return comments ? JSON.parse(comments) : {}
  } catch (error) {
    console.error('获取评论失败:', error)
    return {}
  }
}

// 获取指定视频的评论，返回评论数组
export const getVideoComments = (videoId) => {
  const comments = getComments()
  return comments[videoId] || []
}

// 向视频添加评论，返回添加的评论
export const addVideoComment = (videoId, comment) => {
  try {
    const comments = getComments()
    if (!comments[videoId]) {
      comments[videoId] = []
    }

    // 添加带有ID和时间戳的新评论
    const newComment = {
      id: `comment_${Date.now()}`,
      create_time: new Date().toISOString(),
      is_liked: false,
      like_count: 0,
      ...comment,
    }

    comments[videoId].unshift(newComment)
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
    return newComment
  } catch (error) {
    console.error('添加评论失败:', error)
    throw error
  }
}

// 切换评论点赞状态，返回更新后的评论
export const toggleCommentLike = (videoId, commentId) => {
  try {
    const comments = getComments()
    if (!comments[videoId]) {
      throw new Error('视频未找到')
    }

    const commentIndex = comments[videoId].findIndex((c) => c.id === commentId)
    if (commentIndex === -1) {
      throw new Error('评论未找到')
    }

    const comment = comments[videoId][commentIndex]
    comment.is_liked = !comment.is_liked
    comment.like_count += comment.is_liked ? 1 : -1

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
    return comment
  } catch (error) {
    console.error('切换评论点赞状态失败:', error)
    throw error
  }
}

// 获取所有作者，key是作者ID，value是作者信息
export const getAuthors = () => {
  try {
    const authors = localStorage.getItem(AUTHORS_KEY)
    return authors ? JSON.parse(authors) : {}
  } catch (error) {
    console.error('获取作者信息失败:', error)
    return {}
  }
}

// 获取指定作者的详细信息，返回作者信息
export const getAuthorInfo = (authorId) => {
  const authors = getAuthors()
  return (
    authors[authorId] || {
      id: authorId,
      nickname: `作者${authorId}`,
      avatar: `https://picsum.photos/200/200?random=${authorId}`,
      bio: '',
      followers_count: 0,
      following_count: 0,
      videos_count: 0,
    }
  )
}

// 更新作者信息，返回更新后的作者信息
export const updateAuthorInfo = (authorId, updates) => {
  try {
    const authors = getAuthors()
    if (!authors[authorId]) {
      authors[authorId] = getAuthorInfo(authorId)
    }

    authors[authorId] = { ...authors[authorId], ...updates }
    localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors))
    return authors[authorId]
  } catch (error) {
    console.error('更新作者信息失败:', error)
    throw error
  }
}

// 更新用户信息，返回更新后的用户信息
export const updateUserInfo = (userId, updates) => {
  try {
    // 更新用户信息到本地存储
    const userInfo = {
      userId: parseInt(userId),
      ...updates,
    }

    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    return userInfo
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

//获取所有作品数据，key是用户ID，value是用户的作品数组
export const getWorks = () => {
  try {
    const works = localStorage.getItem(WORKS_KEY)
    return works ? JSON.parse(works) : {}
  } catch (error) {
    console.error('获取作品数据失败:', error)
    return {}
  }
}

//获取指定用户的作品数组，每个作品包含视频URL
export const getUserWorks = (userId) => {
  const works = getWorks()
  if (works[userId]) {
    // 处理作品中的视频URL
    return works[userId].map((work) => {
      let videoUrl = work.video_url || work.src || '/src/assets/VID20260310085246.mp4'
      // 检查是否是特殊格式的视频URL
      if (videoUrl.startsWith('data:video/mp4;base64,')) {
        const videoId = videoUrl.replace('data:video/mp4;base64,', '')
        // 从单独的存储键中获取实际的视频数据
        const storedVideoData = localStorage.getItem(`video_data_${videoId}`)
        if (storedVideoData) {
          videoUrl = storedVideoData
        }
      } else if (videoUrl.startsWith('blob:')) {
        // 如果是Blob URL，使用默认视频
        videoUrl = '/src/assets/VID20260310085246.mp4'
      }
      return {
        ...work,
        video_url: videoUrl,
      }
    })
  }

  // 如果用户没有作品，返回空数组
  return []
}

// 清除所有作品数据，返回操作是否成功
export const clearWorks = () => {
  try {
    localStorage.removeItem(WORKS_KEY)
    return true
  } catch (error) {
    console.error('清除作品数据失败:', error)
    return false
  }
}

/**
 * 获取所有视频
 * @returns {Object} 视频对象，key是视频ID，value是视频信息
 */
export const getVideos = () => {
  try {
    const videos = localStorage.getItem(VIDEOS_KEY)
    return videos ? JSON.parse(videos) : {}
  } catch (error) {
    console.error('获取视频数据失败:', error)
    return {}
  }
}

// 上传视频，返回上传结果
export const uploadVideo = (_formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟上传延迟，返回不同的视频 URL 以模拟不同的视频
      const videoUrls = [
        '/src/assets/VID20260310085246.mp4',
        '/src/assets/VID20260312191109.mp4',
        '/src/assets/VID20260313114703.mp4',
        '/src/assets/VID20260321194008.mp4',
      ]
      // 随机选择一个视频 URL
      const randomUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)]
      // 模拟上传延迟，返回随机的视频 URL
      resolve({
        success: true,
        url: randomUrl,
        id: `video_${Date.now()}`,
      })
    }, 2000)
  })
}

// 添加视频信息，返回添加的视频信息
export const addVideo = (videoInfo) => {
  try {
    // 上传新视频前，先清理旧视频数据以释放空间
    cleanupOldVideoData()

    const videos = getVideos()
    const videoId = `video_${Date.now()}`

    // 使用真实的视频 URL 以便视频能够正常播放
    const videoUrl = videoInfo.url || '/src/assets/VID20260310085246.mp4'
    const coverUrl = videoInfo.cover || `https://picsum.photos/300/300?random=${videoId}`

    // 统一使用字符串类型的 userId
    const userIdStr = videoInfo.userId.toString()

    const newVideo = {
      id: videoId,
      ...videoInfo,
      userId: parseInt(userIdStr), // 存储为数字类型
      video_url: videoUrl,
      cover_url: coverUrl,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      is_liked: false,
      is_followed: false,
      create_time: new Date().toISOString(),
    }

    // 优化存储：对于大型Base64数据，使用单独的存储键
    if (videoUrl.startsWith('data:')) {
      try {
        // 存储视频数据到单独的键
        localStorage.setItem(`video_data_${videoId}`, videoUrl)
        // 在主视频对象中只存储视频ID
        newVideo.video_url = `data:video/mp4;base64,${videoId}`
      } catch (error) {
        console.error('存储视频数据失败:', error)
        throw new Error('视频数据存储失败，请尝试上传更小的视频文件', { cause: error })
      }
    }

    // 限制存储的视频数量，避免超出localStorage配额
    const videoIds = Object.keys(videos)
    if (videoIds.length >= 3) {
      // 删除最旧的视频，只保留最新的3个
      const sortedVideoIds = videoIds.sort((a, b) => {
        const dateA = new Date(videos[a].create_time)
        const dateB = new Date(videos[b].create_time)
        return dateB - dateA // 降序排列
      })

      // 保留最新的3个视频，删除其余的
      const videosToDelete = sortedVideoIds.slice(3)

      videosToDelete.forEach((videoId) => {
        delete videos[videoId]
        localStorage.removeItem(`video_data_${videoId}`)
      })
    }

    videos[videoId] = newVideo
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
    } catch (error) {
      console.error('存储视频失败:', error)
      // 尝试删除最旧的视频，释放空间
      const videoIds = Object.keys(videos)
      if (videoIds.length > 1) {
        const oldestVideoId = videoIds.sort((a, b) => {
          const dateA = new Date(videos[a].create_time)
          const dateB = new Date(videos[b].create_time)
          return dateA - dateB
        })[0]
        delete videos[oldestVideoId]
        localStorage.removeItem(`video_data_${oldestVideoId}`)
        try {
          localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
        } catch (error) {
          console.error('清理后存储视频失败:', error)
          throw new Error('视频存储失败，请尝试上传更小的视频文件', { cause: error })
        }
      } else {
        throw new Error('视频存储失败，请尝试上传更小的视频文件', { cause: error })
      }
    }

    // 同时更新用户的作品列表
    const works = getWorks()
    if (!works[userIdStr]) {
      works[userIdStr] = []
    }

    const workItem = {
      id: videoId,
      cover: coverUrl,
      video_url: newVideo.video_url,
      cover_url: coverUrl,
      description: videoInfo.description || '',
      is_liked: false,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      is_followed: false,
      author: {
        id: parseInt(userIdStr),
        nickname: `用户${userIdStr}`,
        avatar: `https://picsum.photos/200/200?random=${userIdStr}`,
      },
    }

    // 限制用户作品列表的长度
    if (works[userIdStr].length >= 10) {
      works[userIdStr] = works[userIdStr].slice(0, 9)
    }

    works[userIdStr].unshift(workItem)

    try {
      localStorage.setItem(WORKS_KEY, JSON.stringify(works))
    } catch (error) {
      console.error('存储作品失败:', error)
      // 尝试减少作品列表长度，释放空间
      if (works[userIdStr].length > 5) {
        works[userIdStr] = works[userIdStr].slice(0, 5)
        try {
          localStorage.setItem(WORKS_KEY, JSON.stringify(works))
        } catch (error) {
          console.error('清理后存储作品失败:', error)
          throw new Error('作品列表存储失败，请尝试上传更小的视频文件', { cause: error })
        }
      } else {
        throw new Error('作品列表存储失败，请尝试上传更小的视频文件', { cause: error })
      }
    }

    return newVideo
  } catch (error) {
    console.error('添加视频失败:', error)
    throw error
  }
}

// 根据用户ID获取视频，返回用户视频数组
export const getUserVideos = (userId) => {
  try {
    const videos = getVideos()
    const targetUserId = parseInt(userId)
    const userVideos = Object.values(videos).filter((video) => video.userId === targetUserId)
    // 确保每个视频对象都包含 video_url 字段
    return userVideos.map((video) => {
      let videoUrl = video.video_url || video.url || '/src/assets/VID20260310085246.mp4'
      // 检查是否是特殊格式的视频URL
      if (videoUrl.startsWith('data:video/mp4;base64,')) {
        const videoId = videoUrl.replace('data:video/mp4;base64,', '')
        // 从单独的存储键中获取实际的视频数据
        const storedVideoData = localStorage.getItem(`video_data_${videoId}`)
        if (storedVideoData) {
          videoUrl = storedVideoData
        }
      } else if (videoUrl.startsWith('blob:')) {
        // 如果是Blob URL，使用默认视频
        videoUrl = '/src/assets/VID20260310085246.mp4'
      }
      return {
        ...video,
        video_url: videoUrl,
        cover_url:
          video.cover_url || video.cover || `https://picsum.photos/300/300?random=${video.id}`,
      }
    })
  } catch (error) {
    console.error('获取用户视频失败:', error)
    return []
  }
}

// 清除所有视频数据，返回操作是否成功
export const clearVideos = () => {
  try {
    localStorage.removeItem(VIDEOS_KEY)
    return true
  } catch (error) {
    console.error('清除视频数据失败:', error)
    return false
  }
}

// 根据视频ID删除视频，返回操作是否成功
export const deleteVideo = (videoId) => {
  try {
    // 从视频列表中删除
    const videos = getVideos()
    delete videos[videoId]
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))

    // 从所有用户的作品列表中删除
    const works = getWorks()
    for (const userId in works) {
      works[userId] = works[userId].filter((work) => work.id !== videoId)
    }
    localStorage.setItem(WORKS_KEY, JSON.stringify(works))

    return true
  } catch (error) {
    console.error('删除视频失败:', error)
    return false
  }
}

// 清理旧视频数据，释放存储空间

export const cleanupOldVideoData = () => {
  try {
    // 首先获取所有视频数据
    const videos = getVideos()
    const videoIds = Object.keys(videos)

    // 只保留最新的2个视频，删除其余的
    if (videoIds.length > 2) {
      // 按创建时间排序，保留最新的2个
      const sortedVideoIds = videoIds.sort((a, b) => {
        const dateA = new Date(videos[a].create_time)
        const dateB = new Date(videos[b].create_time)
        return dateB - dateA // 降序排列
      })

      // 保留最新的2个视频，删除其余的
      const videosToDelete = sortedVideoIds.slice(2)
      videosToDelete.forEach((videoId) => {
        delete videos[videoId]
        localStorage.removeItem(`video_data_${videoId}`)
      })

      // 更新存储的视频数据
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
    }

    // 清理其他可能占用空间的存储键
    const keysToRemove = [FOLLOW_STATUS_KEY, COMMENTS_KEY, AUTHORS_KEY]
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    console.log('LocalStorage 清理完成')
    return true
  } catch (error) {
    console.error('清理旧视频数据失败:', error)
    return false
  }
}

// 清除所有模拟数据，返回操作是否成功
export const clearAllMockData = () => {
  try {
    localStorage.removeItem(FOLLOW_STATUS_KEY)
    localStorage.removeItem(COMMENTS_KEY)
    localStorage.removeItem(AUTHORS_KEY)
    localStorage.removeItem(WORKS_KEY)
    localStorage.removeItem(VIDEOS_KEY)
    // 同时清除所有视频数据键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('video_data_')) {
        localStorage.removeItem(key)
      }
    }
    return true
  } catch (error) {
    console.error('清除模拟数据失败:', error)
    return false
  }
}
