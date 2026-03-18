<template>
  <div class="video-grid">
    <div v-if="videos.length === 0" class="no-videos">
      <p>暂无视频内容</p>
    </div>
    <div v-else class="grid-container">
      <div
        v-for="(video, index) in videos"
        :key="index"
        class="video-item"
        @click="playVideo(video)"
      >
        <div class="video-thumbnail">
          <img :src="video.thumbnail" alt="视频缩略图" />
          <div class="play-overlay">
            <span class="play-icon">▶</span>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.description }}</p>
          <div class="video-meta">
            <span class="video-duration">{{ video.duration }}</span>
            <span class="video-views">{{ video.views }} 观看</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频播放模态框 -->
    <div v-if="selectedVideo" class="video-modal" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">&times;</button>
        <div class="video-player">
          <iframe
            :src="getEmbedUrl(selectedVideo.url)"
            frameborder="0"
            allowfullscreen
            width="100%"
            height="400"
          ></iframe>
        </div>
        <div class="video-details">
          <h2>{{ selectedVideo.title }}</h2>
          <p>{{ selectedVideo.description }}</p>
          <div class="video-stats">
            <span>{{ selectedVideo.views }} 观看</span>
            <span>{{ selectedVideo.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoGrid',
  props: {
    videos: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedVideo: null
    }
  },
  methods: {
    playVideo(video) {
      this.selectedVideo = video;
    },
    closeModal() {
      this.selectedVideo = null;
    },
    getEmbedUrl(url) {
      // 处理不同平台的嵌入URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(url);
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    },
    extractYouTubeId(url) {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }
  }
}
</script>

<style scoped>
.video-grid {
  padding: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.no-videos {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.video-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-item:hover .video-thumbnail img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: white;
  font-size: 20px;
  margin-left: 3px;
}

.video-info {
  padding: 16px;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.video-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 模态框样式 */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f0f0f0;
}

.video-player {
  padding: 20px 20px 0;
}

.video-details {
  padding: 20px;
}

.video-details h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #333;
}

.video-details p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.6;
}

.video-stats {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .video-thumbnail {
    height: 180px;
  }

  .modal-content {
    width: 95%;
  }
}
</style>